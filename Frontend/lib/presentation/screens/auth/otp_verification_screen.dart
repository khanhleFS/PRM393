import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_event.dart';
import '../../../bloc/auth/auth_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_tokens.dart';

class OtpVerificationScreen extends StatefulWidget {
  final String email;
  const OtpVerificationScreen({super.key, required this.email});
  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final _controllers = List.generate(6, (_) => TextEditingController());
  final _nodes = List.generate(6, (_) => FocusNode());
  String? _error;

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _nodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _onChanged(int index, String value) {
    if (value.length > 1) {
      final start = value.length == 6 ? 0 : index;
      for (var i = start; i < 6 && i - start < value.length; i++) {
        _controllers[i].text = value[i - start];
      }
      _nodes[(start + value.length).clamp(0, 5)].requestFocus();
    } else if (value.isNotEmpty && index < 5) {
      _nodes[index + 1].requestFocus();
    }
    setState(() => _error = null);
  }

  void _onVerify() {
    final code = _controllers.map((c) => c.text).join();
    if (!RegExp(r'^[0-9]{6}$').hasMatch(code)) {
      setState(() => _error = 'Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }
    FocusScope.of(context).unfocus();
    context.read<AuthBloc>().add(
      VerifyOtpRequestedEvent(email: widget.email, otpCode: code),
    );
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: const Text('Xác thực tài khoản')),
    body: BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthOtpVerifiedSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: AppColors.success,
            ),
          );
          Navigator.of(context).pop();
        } else if (state is AuthError) {
          setState(() => _error = state.message);
        }
      },
      builder: (context, state) {
        final isLoading = state is AuthLoading;
        return SafeArea(
          child: SingleChildScrollView(
            padding: AppSpacing.paddingLg,
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: AppSpacing.lg),
                    const Icon(
                      Icons.mark_email_read_outlined,
                      size: 64,
                      color: AppColors.primary,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Text(
                      'Kiểm tra hộp thư của bạn',
                      textAlign: TextAlign.center,
                      style: AppTypography.h1,
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      'Nhập mã xác nhận 6 số đã được gửi tới\n${widget.email}',
                      textAlign: TextAlign.center,
                      style: AppTypography.bodyM,
                    ),
                    const SizedBox(height: AppSpacing.xl),
                    AutofillGroup(
                      child: Row(
                        children: List.generate(
                          6,
                          (index) => Expanded(
                            child: Padding(
                              padding: EdgeInsets.only(
                                right: index == 5 ? 0 : AppSpacing.xs,
                              ),
                              child: Focus(
                                onKeyEvent: (_, event) {
                                  if (event is KeyDownEvent &&
                                      event.logicalKey ==
                                          LogicalKeyboardKey.backspace &&
                                      _controllers[index].text.isEmpty &&
                                      index > 0) {
                                    _controllers[index - 1].clear();
                                    _nodes[index - 1].requestFocus();
                                    return KeyEventResult.handled;
                                  }
                                  return KeyEventResult.ignored;
                                },
                                child: TextField(
                                  controller: _controllers[index],
                                  focusNode: _nodes[index],
                                  enabled: !isLoading,
                                  keyboardType: TextInputType.number,
                                  autofillHints: index == 0
                                      ? const [AutofillHints.oneTimeCode]
                                      : null,
                                  inputFormatters: [
                                    FilteringTextInputFormatter.digitsOnly,
                                    LengthLimitingTextInputFormatter(6),
                                  ],
                                  textAlign: TextAlign.center,
                                  style: AppTypography.h2,
                                  decoration: InputDecoration(
                                    contentPadding: const EdgeInsets.symmetric(
                                      vertical: AppSpacing.md,
                                    ),
                                    labelText: 'Số ${index + 1}',
                                    floatingLabelBehavior:
                                        FloatingLabelBehavior.never,
                                  ),
                                  onChanged: (value) =>
                                      _onChanged(index, value),
                                  onSubmitted: (_) {
                                    if (!isLoading) _onVerify();
                                  },
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                    if (_error != null) ...[
                      const SizedBox(height: AppSpacing.md),
                      Semantics(
                        liveRegion: true,
                        child: Text(
                          _error!,
                          style: AppTypography.bodyM.copyWith(
                            color: AppColors.error,
                          ),
                        ),
                      ),
                    ],
                    const SizedBox(height: AppSpacing.lg),
                    ElevatedButton(
                      onPressed: isLoading ? null : _onVerify,
                      child: isLoading
                          ? const SizedBox(
                              width: 24,
                              height: 24,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                color: AppColors.surface,
                              ),
                            )
                          : const Text('Kích hoạt tài khoản'),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Text(
                      'Chưa nhận được mã? Hãy kiểm tra thư mục Spam hoặc Quảng cáo.',
                      textAlign: TextAlign.center,
                      style: AppTypography.bodyS,
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    ),
  );
}
