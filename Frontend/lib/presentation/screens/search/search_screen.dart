import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/search/search_bloc.dart';
import '../../../bloc/search/search_event.dart';
import '../../../bloc/search/search_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../data/models/novel_model.dart';
import '../../../data/repositories/novel_repository.dart';
import '../../widgets/novel_card.dart';
import '../novel_detail/novel_detail_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _searchFocusNode = FocusNode();

  String? _selectedStatus; // null, 'ONGOING', 'COMPLETED'
  String? _selectedCategory; // null or category name
  bool _isGridView = true;
  List<CategoryModel> _categories = [];
  bool _isLoadingCategories = false;

  final List<String> _popularSuggestions = const [
    'Tiên hiệp',
    'Kiếm hiệp',
    'Đô thị',
    'Huyền huyễn',
    'Trọng sinh',
    'Ngôn tình',
    'Hệ thống',
  ];

  @override
  void initState() {
    super.initState();
    _loadCategories();
    _triggerSearch();
  }

  @override
  void dispose() {
    _searchController.dispose();
    _searchFocusNode.dispose();
    super.dispose();
  }

  Future<void> _loadCategories() async {
    setState(() => _isLoadingCategories = true);
    try {
      final repo = context.read<NovelRepository>();
      final list = await repo.getCategories();
      if (mounted) {
        setState(() {
          _categories = list;
          _isLoadingCategories = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isLoadingCategories = false);
      }
    }
  }

  void _triggerSearch() {
    context.read<SearchBloc>().add(
          SearchNovelsQueryEvent(
            query: _searchController.text.trim(),
            status: _selectedStatus,
            category: _selectedCategory,
          ),
        );
  }

  void _resetFilters() {
    setState(() {
      _searchController.clear();
      _selectedStatus = null;
      _selectedCategory = null;
    });
    _triggerSearch();
  }

  bool get _hasActiveFilters =>
      _searchController.text.isNotEmpty ||
      _selectedStatus != null ||
      _selectedCategory != null;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Tìm kiếm & Khám phá',
          style: AppTypography.h2,
        ),
        backgroundColor: AppColors.background,
        elevation: AppElevation.none,
        scrolledUnderElevation: AppElevation.card,
        actions: [
          if (_hasActiveFilters)
            TextButton.icon(
              onPressed: _resetFilters,
              icon: const Icon(
                Icons.refresh_rounded,
                size: AppIconSize.sm,
                color: AppColors.primary,
              ),
              label: Text(
                'Đặt lại',
                style: AppTypography.button.copyWith(
                  color: AppColors.primary,
                  fontSize: 13,
                ),
              ),
            ),
          const SizedBox(width: AppSpacing.sm),
        ],
      ),
      body: Column(
        children: [
          // 1. Search Box
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.md,
              AppSpacing.xs,
              AppSpacing.md,
              AppSpacing.sm,
            ),
            child: _buildSearchBar(),
          ),

          // 2. Filter Bar (Status & Categories)
          _buildFilterBar(),

          const Divider(
            height: AppSpacing.md,
            thickness: 0.8,
            color: AppColors.divider,
          ),

          // 3. Search Results & View Mode Toggle
          Expanded(
            child: BlocBuilder<SearchBloc, SearchState>(
              builder: (context, state) {
                if (state is SearchLoading) {
                  return _buildLoadingState();
                }

                if (state is SearchError) {
                  return _buildErrorState(state.message);
                }

                if (state is SearchLoaded) {
                  if (state.novels.isEmpty) {
                    return _buildEmptyState();
                  }

                  return Column(
                    children: [
                      _buildResultsHeader(state.novels.length),
                      Expanded(
                        child: _isGridView
                            ? _buildGridView(state.novels)
                            : _buildListView(state.novels),
                      ),
                    ],
                  );
                }

                return _buildEmptyState();
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: AppRadius.roundedLg,
        boxShadow: AppElevation.shadowCard,
        border: Border.all(
          color: _searchFocusNode.hasFocus ? AppColors.primary : AppColors.divider,
          width: _searchFocusNode.hasFocus ? 1.5 : 1.0,
        ),
      ),
      child: TextField(
        controller: _searchController,
        focusNode: _searchFocusNode,
        style: AppTypography.bodyM,
        textInputAction: TextInputAction.search,
        onChanged: (_) => setState(() {}),
        onSubmitted: (_) => _triggerSearch(),
        decoration: InputDecoration(
          hintText: 'Tìm kiếm tên truyện, tác giả...',
          hintStyle: AppTypography.bodyM.copyWith(color: AppColors.textMuted),
          prefixIcon: const Icon(
            Icons.search_rounded,
            size: AppIconSize.md,
            color: AppColors.primary,
          ),
          suffixIcon: _searchController.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(
                    Icons.close_rounded,
                    size: AppIconSize.sm,
                    color: AppColors.textSecondary,
                  ),
                  onPressed: () {
                    _searchController.clear();
                    setState(() {});
                    _triggerSearch();
                  },
                )
              : null,
          filled: true,
          fillColor: Colors.transparent,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.md,
          ),
          border: InputBorder.none,
          enabledBorder: InputBorder.none,
          focusedBorder: InputBorder.none,
        ),
      ),
    );
  }

  Widget _buildFilterBar() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Status row
        SizedBox(
          height: AppSpacing.xl + AppSpacing.xs, // 36.0
          child: ListView(
            scrollDirection: Axis.horizontal,
            padding: AppSpacing.horizontalMd,
            children: [
              _buildChoiceChip(
                label: 'Tất cả trạng thái',
                isSelected: _selectedStatus == null,
                onTap: () {
                  setState(() => _selectedStatus = null);
                  _triggerSearch();
                },
              ),
              const SizedBox(width: AppSpacing.sm),
              _buildChoiceChip(
                label: 'Đang ra',
                isSelected: _selectedStatus == 'ONGOING',
                onTap: () {
                  setState(() {
                    _selectedStatus = _selectedStatus == 'ONGOING' ? null : 'ONGOING';
                  });
                  _triggerSearch();
                },
              ),
              const SizedBox(width: AppSpacing.sm),
              _buildChoiceChip(
                label: 'Hoàn thành',
                isSelected: _selectedStatus == 'COMPLETED',
                onTap: () {
                  setState(() {
                    _selectedStatus = _selectedStatus == 'COMPLETED' ? null : 'COMPLETED';
                  });
                  _triggerSearch();
                },
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.sm),

        // Categories row (dynamic)
        if (_categories.isNotEmpty || _isLoadingCategories)
          SizedBox(
            height: AppSpacing.xl + AppSpacing.xs, // 36.0
            child: _isLoadingCategories
                ? const Center(
                    child: SizedBox(
                      width: AppIconSize.xs,
                      height: AppIconSize.xs,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        color: AppColors.primary,
                      ),
                    ),
                  )
                : ListView.separated(
                    scrollDirection: Axis.horizontal,
                    padding: AppSpacing.horizontalMd,
                    itemCount: _categories.length + 1,
                    separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
                    itemBuilder: (context, index) {
                      if (index == 0) {
                        return _buildChoiceChip(
                          label: 'Tất cả thể loại',
                          isSelected: _selectedCategory == null,
                          isSecondary: true,
                          onTap: () {
                            setState(() => _selectedCategory = null);
                            _triggerSearch();
                          },
                        );
                      }
                      final cat = _categories[index - 1];
                      final isSelected = _selectedCategory == cat.name ||
                          _selectedCategory == cat.slug;
                      return _buildChoiceChip(
                        label: cat.name,
                        isSelected: isSelected,
                        isSecondary: true,
                        onTap: () {
                          setState(() {
                            _selectedCategory = isSelected ? null : cat.name;
                          });
                          _triggerSearch();
                        },
                      );
                    },
                  ),
          ),
      ],
    );
  }

  Widget _buildChoiceChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    bool isSecondary = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppDurations.fast,
        curve: AppCurves.standard,
        alignment: Alignment.center,
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
        ),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surface,
          borderRadius: AppRadius.roundedFull,
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.divider,
            width: isSelected ? 1.0 : 0.8,
          ),
          boxShadow: isSelected ? AppElevation.shadowCard : null,
        ),
        child: Center(
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: (isSelected ? AppTypography.button : AppTypography.bodyS).copyWith(
              color: isSelected ? AppColors.surface : AppColors.textDark,
              fontSize: 13.0,
              fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
              height: 1.0,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResultsHeader(int count) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        0,
        AppSpacing.md,
        AppSpacing.xs,
      ),
      child: Row(
        children: [
          Text(
            'Tìm thấy $count tác phẩm',
            style: AppTypography.h3.copyWith(fontSize: 15),
          ),
          const Spacer(),
          // Toggle View Mode Buttons
          Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: AppRadius.roundedSm,
              border: Border.all(color: AppColors.divider, width: 0.8),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.grid_view_rounded),
                  iconSize: AppIconSize.sm,
                  color: _isGridView ? AppColors.primary : AppColors.disabled,
                  padding: AppSpacing.paddingXs,
                  constraints: const BoxConstraints(),
                  onPressed: () => setState(() => _isGridView = true),
                ),
                Container(
                  width: 1.0,
                  height: AppSpacing.md,
                  color: AppColors.divider,
                ),
                IconButton(
                  icon: const Icon(Icons.view_list_rounded),
                  iconSize: AppIconSize.sm,
                  color: !_isGridView ? AppColors.primary : AppColors.disabled,
                  padding: AppSpacing.paddingXs,
                  constraints: const BoxConstraints(),
                  onPressed: () => setState(() => _isGridView = false),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGridView(List<NovelModel> novels) {
    return GridView.builder(
      padding: AppSpacing.paddingMd,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.62,
        crossAxisSpacing: AppSpacing.md,
        mainAxisSpacing: AppSpacing.md,
      ),
      itemCount: novels.length,
      itemBuilder: (context, index) {
        final novel = novels[index];
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

  Widget _buildListView(List<NovelModel> novels) {
    return ListView.separated(
      padding: AppSpacing.paddingMd,
      itemCount: novels.length,
      separatorBuilder: (_, _) => const SizedBox(height: AppSpacing.sm),
      itemBuilder: (context, index) {
        final novel = novels[index];
        final isCompleted = novel.status.toUpperCase() == 'COMPLETED';

        return Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => NovelDetailScreen(novelId: novel.id),
                ),
              );
            },
            borderRadius: AppRadius.roundedMd,
            child: Container(
              padding: AppSpacing.paddingSm,
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: AppRadius.roundedMd,
                border: Border.all(color: AppColors.divider, width: 0.8),
                boxShadow: AppElevation.shadowCard,
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Book Thumbnail
                  ClipRRect(
                    borderRadius: AppRadius.roundedSm,
                    child: SizedBox(
                      width: AppSpacing.xl3 + AppSpacing.xl, // 80.0
                      height: AppSpacing.xl4 + AppSpacing.xl2, // 104.0
                      child: novel.coverImageUrl.isNotEmpty
                          ? CachedNetworkImage(
                              imageUrl: novel.coverImageUrl,
                              fit: BoxFit.cover,
                              errorWidget: (_, _, _) => Container(
                                color: AppColors.background,
                                child: const Icon(
                                  Icons.menu_book_rounded,
                                  color: AppColors.disabled,
                                  size: AppIconSize.lg,
                                ),
                              ),
                            )
                          : Container(
                              color: AppColors.background,
                              child: const Icon(
                                Icons.menu_book_rounded,
                                color: AppColors.disabled,
                                size: AppIconSize.lg,
                              ),
                            ),
                    ),
                  ),

                  const SizedBox(width: AppSpacing.md),

                  // Book Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          novel.title,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: AppTypography.h3.copyWith(fontSize: 15),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Row(
                          children: [
                            const Icon(
                              Icons.person_outline_rounded,
                              size: AppIconSize.xs,
                              color: AppColors.textSecondary,
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            Expanded(
                              child: Text(
                                novel.authorName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: AppTypography.caption,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        if (novel.description.isNotEmpty)
                          Text(
                            novel.description,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.bodyS.copyWith(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        const SizedBox(height: AppSpacing.sm),
                        Row(
                          children: [
                            // Status Badge
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.xs,
                                vertical: 2,
                              ),
                              decoration: BoxDecoration(
                                color: isCompleted
                                    ? AppColors.completedBadge
                                    : AppColors.warning,
                                borderRadius: AppRadius.roundedSm,
                              ),
                              child: Text(
                                isCompleted ? 'Đã xong' : 'Đang ra',
                                style: AppTypography.overline.copyWith(
                                  color: AppColors.surface,
                                  fontSize: 10,
                                ),
                              ),
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            // Chapters
                            const Icon(
                              Icons.auto_stories_outlined,
                              size: AppIconSize.xs,
                              color: AppColors.textSecondary,
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            Text(
                              '${novel.chapterCount} chương',
                              style: AppTypography.caption,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildLoadingState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(
            width: AppIconSize.xl,
            height: AppIconSize.xl,
            child: CircularProgressIndicator(
              strokeWidth: 3.0,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            'Đang tra cứu thư tịch...',
            style: AppTypography.bodyM.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return SingleChildScrollView(
      padding: AppSpacing.paddingXl,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: AppSpacing.paddingLg,
            decoration: BoxDecoration(
              color: AppColors.surface,
              shape: BoxShape.circle,
              boxShadow: AppElevation.shadowCard,
              border: Border.all(color: AppColors.divider, width: 1.0),
            ),
            child: const Icon(
              Icons.auto_stories_outlined,
              size: AppIconSize.xl,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            'Không tìm thấy tác phẩm',
            textAlign: TextAlign.center,
            style: AppTypography.h2,
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            'Thử thay đổi từ khóa tìm kiếm hoặc lọc theo tiêu chí khác xem sao nhé.',
            textAlign: TextAlign.center,
            style: AppTypography.bodyM.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          if (_hasActiveFilters) ...[
            ElevatedButton.icon(
              onPressed: _resetFilters,
              icon: const Icon(Icons.refresh_rounded, size: AppIconSize.sm),
              label: const Text('Xóa tất cả bộ lọc'),
            ),
            const SizedBox(height: AppSpacing.xl),
          ],

          // Popular suggestions
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Từ khóa gợi ý tìm kiếm:',
                style: AppTypography.h3,
              ),
              const SizedBox(height: AppSpacing.sm),
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: _popularSuggestions.map((tag) {
                  return ActionChip(
                    backgroundColor: AppColors.surface,
                    label: Text(
                      tag,
                      style: AppTypography.bodyS.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    side: const BorderSide(color: AppColors.divider, width: 0.8),
                    shape: RoundedRectangleBorder(
                      borderRadius: AppRadius.roundedFull,
                    ),
                    onPressed: () {
                      _searchController.text = tag;
                      _triggerSearch();
                    },
                  );
                }).toList(),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Padding(
        padding: AppSpacing.paddingLg,
        child: Container(
          padding: AppSpacing.paddingLg,
          decoration: BoxDecoration(
            color: AppColors.surface,
            borderRadius: AppRadius.roundedLg,
            boxShadow: AppElevation.shadowCard,
            border: Border.all(color: AppColors.error, width: 1.0),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.error_outline_rounded,
                color: AppColors.error,
                size: AppIconSize.xl,
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                'Đã xảy ra lỗi khi tìm kiếm',
                style: AppTypography.h3,
              ),
              const SizedBox(height: AppSpacing.xs),
              Text(
                message,
                textAlign: TextAlign.center,
                style: AppTypography.caption.copyWith(color: AppColors.error),
              ),
              const SizedBox(height: AppSpacing.md),
              ElevatedButton(
                onPressed: _triggerSearch,
                child: const Text('Thử lại'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
