import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/novel/novel_bloc.dart';
import '../../../bloc/novel/novel_event.dart';
import '../../../bloc/novel/novel_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../widgets/novel_card.dart';
import '../novel_detail/novel_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();
  String? _selectedStatus;

  @override
  void initState() {
    super.initState();
    _triggerSearch();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _triggerSearch() {
    context.read<NovelBloc>().add(
          SearchNovelsEvent(
            query: _searchController.text.trim(),
            status: _selectedStatus,
          ),
        );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tìm kiếm truyện'),
      ),
      body: Column(
        children: [
          // Search input & filter
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Nhập tên truyện, tác giả...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _triggerSearch();
                        },
                      )
                    : null,
              ),
              onSubmitted: (_) => _triggerSearch(),
            ),
          ),
          // Filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                FilterChip(
                  label: const Text('Tất cả trạng thái'),
                  selected: _selectedStatus == null,
                  onSelected: (_) {
                    setState(() => _selectedStatus = null);
                    _triggerSearch();
                  },
                ),
                const SizedBox(width: 8),
                FilterChip(
                  label: const Text('Đang ra'),
                  selected: _selectedStatus == 'ONGOING',
                  onSelected: (val) {
                    setState(() => _selectedStatus = val ? 'ONGOING' : null);
                    _triggerSearch();
                  },
                ),
                const SizedBox(width: 8),
                FilterChip(
                  label: const Text('Hoàn thành'),
                  selected: _selectedStatus == 'COMPLETED',
                  onSelected: (val) {
                    setState(() => _selectedStatus = val ? 'COMPLETED' : null);
                    _triggerSearch();
                  },
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          // Results
          Expanded(
            child: BlocBuilder<NovelBloc, NovelState>(
              builder: (context, state) {
                if (state is NovelLoading) {
                  return const Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  );
                }

                if (state is NovelSearchLoaded) {
                  if (state.novels.isEmpty) {
                    return Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.search_off_outlined,
                            size: 54,
                            color: Colors.grey.shade400,
                          ),
                          const SizedBox(height: 12),
                          const Text(
                            'Không tìm thấy bộ truyện phù hợp',
                            style: TextStyle(
                              color: AppColors.textSecondary,
                              fontSize: 15,
                            ),
                          ),
                        ],
                      ),
                    );
                  }

                  return GridView.builder(
                    padding: const EdgeInsets.all(16),
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      childAspectRatio: 0.65,
                      crossAxisSpacing: 14,
                      mainAxisSpacing: 16,
                    ),
                    itemCount: state.novels.length,
                    itemBuilder: (context, index) {
                      final novel = state.novels[index];
                      return NovelCard(
                        novel: novel,
                        onTap: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(
                              builder: (_) => NovelDetailScreen(novelId: novel.id),
                            ),
                          );
                        },
                      );
                    },
                  );
                }

                return const SizedBox();
              },
            ),
          ),
        ],
      ),
    );
  }
}
