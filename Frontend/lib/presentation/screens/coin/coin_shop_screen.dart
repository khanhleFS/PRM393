import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_event.dart';
import '../../../bloc/auth/auth_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_tokens.dart';
import '../../../data/models/coin_package_model.dart';
import '../../../data/repositories/coin_repository.dart';
import 'coin_history_screen.dart';

class CoinShopScreen extends StatefulWidget {
  const CoinShopScreen({super.key});

  @override
  State<CoinShopScreen> createState() => _CoinShopScreenState();
}

class _CoinShopScreenState extends State<CoinShopScreen> {
  bool _isLoading = true;
  bool _isCheckingOut = false;
  String? _errorMessage;
  List<CoinPackageModel> _packages = [];

  @override
  void initState() {
    super.initState();
    _loadPackages();
  }

  Future<void> _loadPackages() async {
    _refreshBalance();
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final coinRepo = context.read<CoinRepository>();
      final packages = await coinRepo.getActivePackages();
      if (mounted) {
        setState(() {
          _packages = packages;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = e.toString().replaceAll('Exception: ', '');
          _isLoading = false;
        });
      }
    }
  }

  void _refreshBalance() {
    final auth = context.read<AuthBloc>();
    if (auth.state is Authenticated) {
      auth.add(CheckAuthStatusEvent());
    }
  }

  void _onSelectPackage(CoinPackageModel package) {
    if (_isCheckingOut) return;
    if (context.read<AuthBloc>().state is! Authenticated) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Vui lòng đăng nhập để nạp xu.')),
      );
      return;
    }
    final currencyFormatter = NumberFormat.decimalPattern('vi');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        scrollable: true,
        title: Text(package.name),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Nhận: ${package.baseCoins} xu'),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'Thanh toán: ${currencyFormatter.format(package.priceVnd)} VNĐ',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'Tạo đơn hàng để nhận hướng dẫn thanh toán. Xu chỉ được cập nhật sau khi máy chủ xác nhận giao dịch.',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Hủy'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              _handleCheckout(package);
            },
            child: const Text('Thanh toán ngay'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleCheckout(CoinPackageModel package) async {
    if (_isCheckingOut || context.read<AuthBloc>().state is! Authenticated) {
      return;
    }
    setState(() => _isCheckingOut = true);

    try {
      final repo = context.read<CoinRepository>();
      final orderResult = await repo.createOrder(
        coinPackageId: package.id.toString(),
        orderInfo: 'Nap goi ${package.name}',
      );

      if (!mounted) return;

      final payUrl = orderResult['payUrl'] as String?;
      final orderId = orderResult['id']?.toString() ?? '';
      final isSepayTest = orderResult['paymentProvider'] == 'SEPAY_TEST';
      final paymentCode = orderResult['paymentCode']?.toString() ?? '';
      final qrUrl = orderResult['qrCodeUrl']?.toString();
      bool checkingStatus = false;

      // Show payment details dialog
      await showDialog(
        context: context,
        builder: (ctx) => StatefulBuilder(
          builder: (ctx, setDialogState) => AlertDialog(
            scrollable: true,
            title: const Text('Đơn hàng đang chờ thanh toán'),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Mã đơn hàng: ${orderId.isEmpty ? 'Chưa có' : orderId}'),
                const SizedBox(height: 8),
                Text('Gói xu: ${package.name} (+${package.baseCoins} xu)'),
                const SizedBox(height: AppSpacing.md),
                if (isSepayTest) ...[
                  const Text(
                    'SEPAY TEST MODE — KHÔNG CHUYỂN TIỀN THẬT',
                    style: TextStyle(
                      fontWeight: FontWeight.bold,
                      color: AppColors.error,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  if (qrUrl != null && qrUrl.isNotEmpty)
                    Center(
                      child: Image.network(
                        qrUrl,
                        width: 200,
                        height: 200,
                        errorBuilder: (_, error, stack) => const Text(
                          'Không tải được ảnh QR. Hãy dùng mã và số tiền bên dưới.',
                        ),
                      ),
                    ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'Số tiền mô phỏng: ${NumberFormat.decimalPattern('vi').format(orderResult['amountVnd'] ?? package.priceVnd)} đ',
                  ),
                  const Text('Nội dung chuyển khoản:'),
                  SelectableText(
                    paymentCode,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  TextButton.icon(
                    onPressed: () =>
                        Clipboard.setData(ClipboardData(text: paymentCode)),
                    icon: const Icon(Icons.copy),
                    label: const Text('Sao chép mã thanh toán'),
                  ),
                  const Text(
                    'Vào dashboard SePay Test mode → Mô phỏng giao dịch. Chọn tiền vào, đúng tài khoản, số tiền và nội dung ở trên. Không quét QR bằng ứng dụng ngân hàng thật.',
                  ),
                ] else if (payUrl != null && payUrl.isNotEmpty) ...[
                  const Text(
                    'Vui lòng mở liên kết sau để hoàn tất thanh toán MoMo:',
                    style: TextStyle(fontSize: 13),
                  ),
                  const SizedBox(height: 8),
                  SelectableText(
                    payUrl,
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textPrimary,
                      decoration: TextDecoration.underline,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  ElevatedButton.icon(
                    onPressed: () {
                      Clipboard.setData(ClipboardData(text: payUrl));
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'Đã sao chép link thanh toán vào bộ nhớ tạm',
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.copy, size: 16),
                    label: const Text('Sao chép link thanh toán'),
                  ),
                ] else
                  const Text('Đơn hàng đã được ghi nhận vào hệ thống.'),
              ],
            ),
            actions: [
              ElevatedButton(
                onPressed: checkingStatus
                    ? null
                    : () async {
                        if (!isSepayTest) {
                          Navigator.pop(ctx);
                          context.read<AuthBloc>().add(CheckAuthStatusEvent());
                          return;
                        }
                        setDialogState(() => checkingStatus = true);
                        try {
                          final latest = await repo.getOrder(orderId);
                          if (!ctx.mounted || !mounted) return;
                          if (latest['status'] == 'COMPLETED') {
                            Navigator.pop(ctx);
                            context.read<AuthBloc>().add(
                              CheckAuthStatusEvent(),
                            );
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Giao dịch thử nghiệm đã được xác nhận. Đang cập nhật số dư.',
                                ),
                              ),
                            );
                          } else {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text(
                                  'Đơn hàng: ${latest['status'] ?? 'PENDING'}. Chưa có xác nhận thanh toán.',
                                ),
                              ),
                            );
                          }
                        } catch (_) {
                          if (mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Không kiểm tra được đơn hàng. Vui lòng thử lại.',
                                ),
                              ),
                            );
                          }
                        } finally {
                          if (ctx.mounted) {
                            setDialogState(() => checkingStatus = false);
                          }
                        }
                      },
                child: const Text('Kiểm tra số dư'),
              ),
            ],
          ),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll('Exception: ', '')),
          backgroundColor: AppColors.error,
        ),
      );
    } finally {
      if (mounted) setState(() => _isCheckingOut = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat.decimalPattern('vi');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nạp xu đọc truyện'),
        actions: [
          if (context.watch<AuthBloc>().state is Authenticated)
            IconButton(
              tooltip: 'Lịch sử giao dịch',
              icon: const Icon(Icons.receipt_long),
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const CoinHistoryScreen()),
              ),
            ),
          IconButton(
            tooltip: 'Làm mới số dư',
            onPressed: _refreshBalance,
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 720),
          child: _isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: AppColors.primary),
                )
              : RefreshIndicator(
                  onRefresh: _loadPackages,
                  child: ListView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    padding: AppSpacing.paddingMd,
                    children: [
                      // Current Balance Banner
                      BlocBuilder<AuthBloc, AuthState>(
                        builder: (context, authState) {
                          final coins = authState is Authenticated
                              ? authState.user.coinBalance
                              : 0;
                          return Container(
                            padding: AppSpacing.paddingLg,
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withValues(
                                    alpha: 0.3,
                                  ),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    color: AppColors.surface.withValues(
                                      alpha: 0.2,
                                    ),
                                    shape: BoxShape.circle,
                                  ),
                                  child: const Icon(
                                    Icons.monetization_on,
                                    size: 36,
                                    color: AppColors.coinGold,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      const Text(
                                        'Số dư xu hiện tại',
                                        style: TextStyle(
                                          color: AppColors.textSecondary,
                                          fontSize: 13,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${currencyFormatter.format(coins)} Xu',
                                        style: const TextStyle(
                                          color: AppColors.coinGold,
                                          fontSize: 32,
                                          fontWeight: FontWeight.w800,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                      const SizedBox(height: 24),

                      Text('Chọn gói nạp xu', style: AppTypography.h2),
                      const SizedBox(height: AppSpacing.md),

                      if (_errorMessage != null)
                        Center(
                          child: Column(
                            children: [
                              Text(
                                _errorMessage!,
                                style: const TextStyle(color: AppColors.error),
                              ),
                              TextButton.icon(
                                onPressed: _loadPackages,
                                icon: const Icon(Icons.refresh),
                                label: const Text('Thử lại'),
                              ),
                            ],
                          ),
                        )
                      else if (_packages.isEmpty)
                        const Center(
                          child: Padding(
                            padding: EdgeInsets.all(24),
                            child: Text(
                              'Chưa có gói nạp nào đang hoạt động.',
                              style: TextStyle(color: AppColors.textSecondary),
                            ),
                          ),
                        )
                      else
                        LayoutBuilder(
                          builder: (context, constraints) {
                            final columns = constraints.maxWidth >= 480 ? 2 : 1;
                            final width =
                                (constraints.maxWidth -
                                    AppSpacing.md * (columns - 1)) /
                                columns;
                            return Wrap(
                              spacing: AppSpacing.md,
                              runSpacing: AppSpacing.md,
                              children: _packages
                                  .map(
                                    (pkg) => SizedBox(
                                      width: width,
                                      child: Card(
                                        margin: EdgeInsets.zero,
                                        child: Padding(
                                          padding: AppSpacing.paddingMd,
                                          child: Column(
                                            crossAxisAlignment:
                                                CrossAxisAlignment.stretch,
                                            children: [
                                              const Align(
                                                alignment: Alignment.centerLeft,
                                                child: Icon(
                                                  Icons
                                                      .monetization_on_outlined,
                                                  color: AppColors.coinGold,
                                                  size: 32,
                                                ),
                                              ),
                                              const SizedBox(
                                                height: AppSpacing.md,
                                              ),
                                              Text(
                                                pkg.name,
                                                style: AppTypography.h2,
                                              ),
                                              const SizedBox(
                                                height: AppSpacing.sm,
                                              ),
                                              Text(
                                                '${currencyFormatter.format(pkg.baseCoins)} xu',
                                                style: AppTypography.h1
                                                    .copyWith(
                                                      color: AppColors.primary,
                                                    ),
                                              ),
                                              const SizedBox(
                                                height: AppSpacing.md,
                                              ),
                                              ElevatedButton(
                                                onPressed: _isCheckingOut
                                                    ? null
                                                    : () =>
                                                          _onSelectPackage(pkg),
                                                child: Text(
                                                  '${currencyFormatter.format(pkg.priceVnd)} đ',
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ),
                                    ),
                                  )
                                  .toList(),
                            );
                          },
                        ),
                      if (_isCheckingOut) ...[
                        const SizedBox(height: AppSpacing.md),
                        const LinearProgressIndicator(color: AppColors.primary),
                        const SizedBox(height: AppSpacing.sm),
                        const Text(
                          'Đang xử lý đơn hàng…',
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ],
                  ),
                ),
        ),
      ),
    );
  }
}
