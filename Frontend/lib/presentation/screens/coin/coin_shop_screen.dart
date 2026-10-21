import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';
import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_event.dart';
import '../../../bloc/auth/auth_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/coin_package_model.dart';
import '../../../data/repositories/coin_repository.dart';

class CoinShopScreen extends StatefulWidget {
  const CoinShopScreen({super.key});

  @override
  State<CoinShopScreen> createState() => _CoinShopScreenState();
}

class _CoinShopScreenState extends State<CoinShopScreen> {
  bool _isLoading = true;
  String? _errorMessage;
  List<CoinPackageModel> _packages = [];

  @override
  void initState() {
    super.initState();
    _loadPackages();
  }

  Future<void> _loadPackages() async {
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

  void _onSelectPackage(CoinPackageModel package) {
    final currencyFormatter = NumberFormat('#,###');
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(package.name),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Nhận: ${package.baseCoins} xu'),
            const SizedBox(height: 6),
            Text(
              'Thanh toán: ${currencyFormatter.format(package.priceVnd)} VNĐ',
              style: const TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 14),
            const Text(
              'Thanh toán an toàn qua cổng MoMo / VNPay.',
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
            onPressed: () async {
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
    // Show loading modal
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => const Center(
        child: CircularProgressIndicator(color: AppColors.primary),
      ),
    );

    try {
      final repo = context.read<CoinRepository>();
      final orderResult = await repo.createOrder(
        coinPackageId: package.id.toString(),
        orderInfo: 'Nap goi ${package.name}',
      );

      if (!mounted) return;
      Navigator.pop(context); // Close loading modal

      final payUrl = orderResult['payUrl'] as String?;
      final orderId = orderResult['id']?.toString() ?? '';

      // Show payment details dialog
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          title: const Text('Tạo đơn hàng thành công'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Mã đơn hàng: ${orderId.isNotEmpty ? orderId.substring(0, 8) : ''}...'),
              const SizedBox(height: 8),
              Text('Gói xu: ${package.name} (+${package.baseCoins} xu)'),
              const SizedBox(height: 12),
              if (payUrl != null && payUrl.isNotEmpty) ...[
                const Text(
                  'Vui lòng mở liên kết sau để hoàn tất thanh toán MoMo:',
                  style: TextStyle(fontSize: 13),
                ),
                const SizedBox(height: 8),
                SelectableText(
                  payUrl,
                  style: const TextStyle(
                    fontSize: 12,
                    color: Colors.blue,
                    decoration: TextDecoration.underline,
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton.icon(
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: payUrl));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Đã sao chép link thanh toán vào bộ nhớ tạm'),
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
              onPressed: () {
                Navigator.pop(ctx);
                // Refresh balance
                context.read<AuthBloc>().add(CheckAuthStatusEvent());
              },
              child: const Text('Đã hoàn tất thanh toán'),
            ),
          ],
        ),
      );
    } catch (e) {
      if (!mounted) return;
      Navigator.pop(context); // Close loading modal
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll('Exception: ', '')),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final currencyFormatter = NumberFormat('#,###');

    return Scaffold(
      appBar: AppBar(
        title: const Text('Nạp xu đọc truyện'),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            )
          : RefreshIndicator(
              onRefresh: _loadPackages,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Current Balance Banner
                  BlocBuilder<AuthBloc, AuthState>(
                    builder: (context, authState) {
                      final coins = authState is Authenticated
                          ? authState.user.coinBalance
                          : 0;
                      return Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.primary, AppColors.primaryDark],
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.3),
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
                                color: Colors.white.withValues(alpha: 0.2),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.monetization_on,
                                size: 36,
                                color: Colors.amber,
                              ),
                            ),
                            const SizedBox(width: 16),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'Số dư xu hiện tại',
                                  style: TextStyle(
                                    color: Colors.white70,
                                    fontSize: 13,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  '${currencyFormatter.format(coins)} Xu',
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 24,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    'Chọn gói nạp xu',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),

                  if (_errorMessage != null)
                    Center(
                      child: Text(
                        _errorMessage!,
                        style: const TextStyle(color: Colors.red),
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
                    ..._packages.map((pkg) {
                      return Card(
                        margin: const EdgeInsets.only(bottom: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          leading: const CircleAvatar(
                            backgroundColor: Colors.amber,
                            child: Icon(
                              Icons.monetization_on,
                              color: Colors.white,
                            ),
                          ),
                          title: Text(
                            pkg.name,
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          subtitle: Text(
                            '${pkg.baseCoins} Xu',
                            style: const TextStyle(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          trailing: ElevatedButton(
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 10,
                              ),
                            ),
                            onPressed: () => _onSelectPackage(pkg),
                            child: Text(
                              '${currencyFormatter.format(pkg.priceVnd)} đ',
                              style: const TextStyle(fontSize: 13),
                            ),
                          ),
                        ),
                      );
                    }),
                ],
              ),
            ),
    );
  }
}
