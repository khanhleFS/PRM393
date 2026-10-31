import '../../widgets/app_network_image.dart';
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
  bool _isGridView = false;
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
          // 1. Search Box with Filter Button on the right
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.md,
              AppSpacing.xs,
              AppSpacing.md,
              AppSpacing.xs,
            ),
            child: Row(
              children: [
                Expanded(
                  child: _buildSearchBar(),
                ),
                const SizedBox(width: AppSpacing.sm),
                _buildFilterButton(),
              ],
            ),
          ),

          // Active filter tags (if any filter is selected)
          if (_selectedCategory != null || _selectedStatus != null)
            _buildActiveFilterBadges(),

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

  Widget _buildFilterButton() {
    final hasFilter = _selectedCategory != null || _selectedStatus != null;
    final filterCount = (_selectedCategory != null ? 1 : 0) +
        (_selectedStatus != null ? 1 : 0);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: _openFilterBottomSheet,
        borderRadius: AppRadius.roundedLg,
        child: Container(
          height: 48,
          width: 48,
          decoration: BoxDecoration(
            color: hasFilter ? AppColors.primary : AppColors.surface,
            borderRadius: AppRadius.roundedLg,
            border: Border.all(
              color: hasFilter ? AppColors.primary : AppColors.divider,
              width: 1.0,
            ),
            boxShadow: hasFilter
                ? [
                    BoxShadow(
                      color: AppColors.primary.withValues(alpha: 0.3),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : AppElevation.shadowCard,
          ),
          child: Stack(
            alignment: Alignment.center,
            children: [
              Icon(
                Icons.tune_rounded,
                size: 22,
                color: hasFilter ? Colors.white : AppColors.primary,
              ),
              if (hasFilter)
                Positioned(
                  top: 5,
                  right: 5,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '$filterCount',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                        height: 1,
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildActiveFilterBadges() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.xs,
        AppSpacing.md,
        0,
      ),
      child: Row(
        children: [
          Text(
            'Đang lọc:',
            style: AppTypography.caption.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  if (_selectedCategory != null) ...[
                    _buildActiveBadge(
                      label: 'Thể loại: $_selectedCategory',
                      onRemove: () {
                        setState(() => _selectedCategory = null);
                        _triggerSearch();
                      },
                    ),
                    const SizedBox(width: AppSpacing.xs),
                  ],
                  if (_selectedStatus != null) ...[
                    _buildActiveBadge(
                      label: _selectedStatus == 'ONGOING'
                          ? 'Đang ra'
                          : 'Hoàn thành',
                      onRemove: () {
                        setState(() => _selectedStatus = null);
                        _triggerSearch();
                      },
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveBadge({
    required String label,
    required VoidCallback onRemove,
  }) {
    return Container(
      padding: const EdgeInsets.fromLTRB(10, 4, 6, 4),
      decoration: BoxDecoration(
        color: AppColors.primary.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.primary.withValues(alpha: 0.35),
          width: 0.8,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.w600,
              fontSize: 12,
            ),
          ),
          const SizedBox(width: 4),
          GestureDetector(
            onTap: onRemove,
            child: const Icon(
              Icons.close_rounded,
              size: 14,
              color: AppColors.primary,
            ),
          ),
        ],
      ),
    );
  }

  void _openFilterBottomSheet() {
    String? tempStatus = _selectedStatus;
    String? tempCategory = _selectedCategory;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (context, setSheetState) {
            return Container(
              constraints: BoxConstraints(
                maxHeight: MediaQuery.of(context).size.height * 0.78,
              ),
              decoration: const BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Drag Handle
                  Container(
                    margin: const EdgeInsets.only(top: 10, bottom: 6),
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: AppColors.divider,
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),

                  // Header
                  Padding(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.xs,
                    ),
                    child: Row(
                      children: [
                        Text('Bộ lọc tìm kiếm', style: AppTypography.h3),
                        const Spacer(),
                        if (tempStatus != null || tempCategory != null)
                          TextButton(
                            onPressed: () {
                              setSheetState(() {
                                tempStatus = null;
                                tempCategory = null;
                              });
                            },
                            child: Text(
                              'Đặt lại',
                              style: AppTypography.button.copyWith(
                                color: AppColors.primary,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        IconButton(
                          icon: const Icon(Icons.close_rounded, size: 20),
                          onPressed: () => Navigator.of(sheetContext).pop(),
                        ),
                      ],
                    ),
                  ),
                  const Divider(
                    height: 1,
                    thickness: 0.8,
                    color: AppColors.divider,
                  ),

                  // Scrollable filter content
                  Expanded(
                    child: SingleChildScrollView(
                      padding: AppSpacing.paddingMd,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Status Section
                          Text(
                            'TRẠNG THÁI TRUYỆN',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          Wrap(
                            spacing: AppSpacing.sm,
                            runSpacing: AppSpacing.sm,
                            children: [
                              _buildSheetChip(
                                label: 'Tất cả trạng thái',
                                isSelected: tempStatus == null,
                                onTap: () =>
                                    setSheetState(() => tempStatus = null),
                              ),
                              _buildSheetChip(
                                label: 'Đang ra',
                                isSelected: tempStatus == 'ONGOING',
                                onTap: () => setSheetState(
                                  () => tempStatus =
                                      tempStatus == 'ONGOING' ? null : 'ONGOING',
                                ),
                              ),
                              _buildSheetChip(
                                label: 'Hoàn thành',
                                isSelected: tempStatus == 'COMPLETED',
                                onTap: () => setSheetState(
                                  () => tempStatus = tempStatus == 'COMPLETED'
                                      ? null
                                      : 'COMPLETED',
                                ),
                              ),
                            ],
                          ),

                          const SizedBox(height: AppSpacing.lg),

                          // Category Section
                          Text(
                            'THỂ LOẠI',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.sm),
                          if (_categories.isEmpty && _isLoadingCategories)
                            const Center(
                              child: Padding(
                                padding: EdgeInsets.all(16.0),
                                child: CircularProgressIndicator(
                                  color: AppColors.primary,
                                ),
                              ),
                            )
                          else
                            Wrap(
                              spacing: AppSpacing.sm,
                              runSpacing: AppSpacing.sm,
                              children: [
                                _buildSheetChip(
                                  label: 'Tất cả thể loại',
                                  isSelected: tempCategory == null,
                                  onTap: () =>
                                      setSheetState(() => tempCategory = null),
                                ),
                                ..._categories.map((cat) {
                                  final isSelected = tempCategory == cat.name ||
                                      tempCategory == cat.slug;
                                  return _buildSheetChip(
                                    label: cat.name,
                                    isSelected: isSelected,
                                    onTap: () => setSheetState(
                                      () => tempCategory =
                                          isSelected ? null : cat.name,
                                    ),
                                  );
                                }),
                              ],
                            ),
                        ],
                      ),
                    ),
                  ),

                  // Bottom Apply Button
                  SafeArea(
                    child: Padding(
                      padding: AppSpacing.paddingMd,
                      child: SizedBox(
                        width: double.infinity,
                        height: 46,
                        child: ElevatedButton(
                          onPressed: () {
                            setState(() {
                              _selectedStatus = tempStatus;
                              _selectedCategory = tempCategory;
                            });
                            Navigator.of(sheetContext).pop();
                            _triggerSearch();
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: AppRadius.roundedMd,
                            ),
                          ),
                          child: const Text(
                            'Áp dụng bộ lọc',
                            style: TextStyle(
                              fontSize: 14.5,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildSheetChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: AppDurations.fast,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.surface,
          borderRadius: AppRadius.roundedMd,
          border: Border.all(
            color: isSelected ? AppColors.primary : AppColors.divider,
            width: 0.8,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.25),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ]
              : AppElevation.shadowCard,
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            color: isSelected ? Colors.white : AppColors.textDark,
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
                      child: AppNetworkImage(
                        imageUrl: novel.coverImageUrl,
                        fit: BoxFit.cover,
                        memCacheWidth: 200,
                        memCacheHeight: 260,
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
          child: SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
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
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
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
      ),
    );
  }
}
