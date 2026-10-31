import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_event.dart';
import '../../../bloc/auth/auth_state.dart';
import '../../../core/constants/api_endpoints.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_tokens.dart';

import 'package:intl/intl.dart';

import '../auth/login_screen.dart';
import '../coin/coin_shop_screen.dart';
import '../coin/coin_history_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});
  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  Future<void> _showServerConfigDialog(BuildContext context) async {
    final newUrl = await showDialog<String>(
      context: context,
      builder: (_) => const _ServerConfigDialog(),
    );
    if (newUrl != null && context.mounted) {
      setState(() {});
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Đã cập nhật Base URL thành: $newUrl'),
          backgroundColor: AppColors.success,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Tài khoản cá nhân')),
      body: BlocBuilder<AuthBloc, AuthState>(
        builder: (context, state) {
          final isAuth = state is Authenticated;
          final user = isAuth ? state.user : null;

          return Center(
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 640),
              child: ListView(
                padding: AppSpacing.paddingLg,
                children: [
                  // User Card
                  Container(
                    padding: AppSpacing.paddingLg,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.textPrimary.withValues(alpha: 0.04),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 32,
                          backgroundColor: AppColors.primary.withValues(
                            alpha: 0.15,
                          ),
                          child: Icon(
                            isAuth ? Icons.person : Icons.person_outline,
                            size: 36,
                            color: AppColors.primary,
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                isAuth ? user!.username : 'Khách vãng lai',
                                style: AppTypography.h2,
                              ),
                              const SizedBox(height: 4),
                              Text(
                                isAuth
                                    ? user!.email
                                    : 'Chưa đăng nhập tài khoản',
                                style: const TextStyle(
                                  fontSize: 13,
                                  color: AppColors.textSecondary,
                                ),
                              ),
                              if (isAuth) ...[
                                const SizedBox(height: AppSpacing.sm),
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 2,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.warning.withValues(
                                      alpha: 0.12,
                                    ),
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    user!.role,
                                    style: const TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.lg),

                  // Coin Balance Tile
                  if (isAuth)
                    ListTile(
                      tileColor: AppColors.surface,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      leading: const Icon(
                        Icons.monetization_on,
                        color: AppColors.coinGold,
                      ),
                      title: const Text('Số dư xu đọc truyện'),
                      subtitle: Text(
                        '${NumberFormat.decimalPattern('vi').format(user!.coinBalance)} xu',
                        style: AppTypography.h1.copyWith(
                          color: AppColors.coinGold,
                        ),
                      ),
                      trailing: TextButton(
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => const CoinShopScreen(),
                            ),
                          );
                        },
                        child: const Text('Nạp xu'),
                      ),
                    ),
                  const SizedBox(height: AppSpacing.lg),

                  if (isAuth) ...[
                    ListTile(
                      leading: const Icon(Icons.receipt_long),
                      title: const Text('Lịch sử giao dịch'),
                      subtitle: const Text('Xu nhận vào và xu đã chi'),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const CoinHistoryScreen(),
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                  ],
                  // Settings Header
                  const Text(
                    'Cài đặt & Kết nối',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 8),

                  Card(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        ListTile(
                          leading: const Icon(
                            Icons.dns_outlined,
                            color: AppColors.primary,
                          ),
                          title: const Text('Cấu hình Backend API IP'),
                          subtitle: Text(
                            ApiEndpoints.baseUrl,
                            style: const TextStyle(fontSize: 12),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => _showServerConfigDialog(context),
                        ),
                        const Divider(height: 1),
                        const ListTile(
                          leading: Icon(
                            Icons.info_outline,
                            color: AppColors.secondary,
                          ),
                          title: Text('Phiên bản ứng dụng'),
                          trailing: Text('1.0.0 (PRM393)'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xl),

                  // Auth Actions
                  if (isAuth)
                    ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.error.withValues(
                          alpha: 0.08,
                        ),
                        foregroundColor: AppColors.error,
                        elevation: 0,
                      ),
                      icon: const Icon(Icons.logout),
                      label: const Text('Đăng xuất'),
                      onPressed: () async {
                        final confirmed = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            title: const Text('Đăng xuất?'),
                            content: const Text(
                              'Bạn có thể đăng nhập lại để tiếp tục đọc truyện và sử dụng xu.',
                            ),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: const Text('Ở lại'),
                              ),
                              ElevatedButton(
                                onPressed: () => Navigator.pop(ctx, true),
                                child: const Text('Đăng xuất'),
                              ),
                            ],
                          ),
                        );
                        if (confirmed == true && context.mounted) {
                          context.read<AuthBloc>().add(LogoutRequestedEvent());
                        }
                      },
                    )
                  else
                    ElevatedButton.icon(
                      icon: const Icon(Icons.login),
                      label: const Text('Đăng nhập tài khoản'),
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (_) => const LoginScreen(),
                          ),
                        );
                      },
                    ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _ServerConfigDialog extends StatefulWidget {
  const _ServerConfigDialog();
  @override
  State<_ServerConfigDialog> createState() => _ServerConfigDialogState();
}

class _ServerConfigDialogState extends State<_ServerConfigDialog> {
  final formKey = GlobalKey<FormState>();
  final controller = TextEditingController(text: ApiEndpoints.baseUrl);
  @override
  void dispose() {
    controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: const Text('Cấu hình kết nối Backend'),
    content: Form(
      key: formKey,
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Địa chỉ API Base URL hiện tại:',
              style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: controller,
              keyboardType: TextInputType.url,
              validator: (value) {
                final uri = Uri.tryParse(value?.trim() ?? '');
                if (uri == null ||
                    !['http', 'https'].contains(uri.scheme) ||
                    uri.host.isEmpty ||
                    uri.hasQuery ||
                    uri.hasFragment ||
                    uri.userInfo.isNotEmpty ||
                    !uri.path.replaceAll(RegExp(r'/+$'), '').endsWith('/api')) {
                  return 'Nhập URL http/https hợp lệ, gồm đường dẫn /api.';
                }
                return null;
              },
              decoration: const InputDecoration(
                hintText: 'http://10.0.2.2:8080/api',
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            const Text(
              'Gợi ý:\n• Máy ảo Android Emulator: http://10.0.2.2:8080/api\n• Máy ảo Genymotion: http://10.0.3.2:8080/api\n• Máy thật cắm USB / cùng WiFi: http://<IP_Máy_Tính>:8080/api\n• Trình duyệt Web / Desktop: http://localhost:8080/api',
              style: TextStyle(
                fontSize: 11,
                color: AppColors.textSecondary,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
    ),
    actions: [
      TextButton(
        onPressed: () => Navigator.pop(context),
        child: const Text('Hủy'),
      ),
      ElevatedButton(
        onPressed: () async {
          final newUrl = controller.text.trim();
          if (formKey.currentState!.validate()) {
            await ApiEndpoints.setBaseUrl(newUrl);
            if (context.mounted) {
              Navigator.pop(context, newUrl);
            }
          }
        },
        child: const Text('Lưu cấu hình'),
      ),
    ],
  );
}
