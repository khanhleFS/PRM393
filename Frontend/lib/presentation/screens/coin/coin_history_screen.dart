import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:intl/intl.dart';

import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_event.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/coin_package_model.dart';
import '../../../data/repositories/coin_repository.dart';

class CoinHistoryScreen extends StatefulWidget {
  const CoinHistoryScreen({super.key});
  @override
  State<CoinHistoryScreen> createState() => _CoinHistoryScreenState();
}

class _CoinHistoryScreenState extends State<CoinHistoryScreen> {
  final List<CoinTransactionModel> _items = [];
  bool _loading = false;
  bool _hasMore = true;
  String? _error;
  int _page = 0;
  static const _pageSize = 20;

  @override
  void initState() {
    super.initState();
    _load(reset: true);
  }

  Future<void> _load({bool reset = false}) async {
    if (_loading) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final page = reset ? 0 : _page;
      final rows = await context.read<CoinRepository>().getCoinTransactions(
        page: page,
        size: _pageSize,
      );
      if (!mounted) return;
      setState(() {
        if (reset) _items.clear();
        final known = _items.map((e) => e.id).toSet();
        _items.addAll(rows.where((e) => known.add(e.id)));
        _page = page + 1;
        _hasMore = rows.length == _pageSize;
      });
      if (reset && mounted) {
        context.read<AuthBloc>().add(CheckAuthStatusEvent());
      }
    } catch (_) {
      if (mounted) {
        setState(
          () => _error = 'Không tải được lịch sử giao dịch. Vui lòng thử lại.',
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _title(String type) => switch (type) {
    'TOPUP' => 'Nạp xu',
    'UNLOCKED_CHAPTER' => 'Mở khóa chương',
    'AUTHOR_REVENUE' => 'Thu nhập tác giả',
    _ => 'Biến động xu',
  };

  String _date(String value) {
    final date = DateTime.tryParse(value);
    return date == null
        ? 'Chưa có thời gian'
        : DateFormat('dd/MM/yyyy HH:mm').format(date.toLocal());
  }

  @override
  Widget build(BuildContext context) {
    final number = NumberFormat.decimalPattern('vi');
    return Scaffold(
      appBar: AppBar(
        title: const Text('Lịch sử giao dịch'),
        actions: [
          IconButton(
            tooltip: 'Làm mới lịch sử',
            onPressed: _loading ? null : () => _load(reset: true),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 640),
          child: RefreshIndicator(
            onRefresh: () => _load(reset: true),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              children: [
                const Text(
                  'Biến động ví xu',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                ),
                const SizedBox(height: 4),
                const Text(
                  'Dấu + là xu nhận vào, dấu − là xu đã chi. Mới nhất ở trên.',
                ),
                const SizedBox(height: 16),
                if (_items.isEmpty && _loading)
                  const Center(child: CircularProgressIndicator()),
                if (_items.isEmpty && !_loading && _error == null)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 40),
                    child: Text(
                      'Chưa có giao dịch xu.',
                      textAlign: TextAlign.center,
                    ),
                  ),
                for (final tx in _items)
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Text(
                                  _title(tx.type),
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                '${tx.amount >= 0 ? '+' : '−'}${number.format(tx.amount.abs())} xu',
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                  color: tx.amount >= 0
                                      ? AppColors.success
                                      : AppColors.error,
                                ),
                              ),
                            ],
                          ),
                          if (tx.note?.isNotEmpty == true) ...[
                            const SizedBox(height: 8),
                            Text(tx.note!),
                          ],
                          const SizedBox(height: 8),
                          Text(_date(tx.createdAt)),
                          if (tx.balanceAfter != null)
                            Text(
                              'Số dư sau giao dịch: ${number.format(tx.balanceAfter)} xu',
                            ),
                          const SizedBox(height: 8),
                          SelectableText(
                            'Mã giao dịch: ${tx.id}',
                            style: const TextStyle(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                if (_error != null) ...[
                  Text(_error!, style: const TextStyle(color: AppColors.error)),
                  TextButton(
                    onPressed: _loading
                        ? null
                        : () => _load(reset: _items.isEmpty),
                    child: const Text('Thử lại'),
                  ),
                ] else if (_hasMore && _items.isNotEmpty)
                  TextButton(
                    onPressed: _loading ? null : () => _load(),
                    child: Text(_loading ? 'Đang tải…' : 'Xem thêm'),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
