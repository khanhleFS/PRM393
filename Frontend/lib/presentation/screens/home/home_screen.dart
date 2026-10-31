import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_state.dart';
import '../../../bloc/novel/novel_bloc.dart';
import '../../../bloc/novel/novel_event.dart';
import '../../../bloc/novel/novel_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_tokens.dart';
import '../../../data/models/novel_model.dart';
import '../../widgets/app_network_image.dart';
import '../../widgets/coin_badge.dart';
import '../../widgets/novel_card.dart';
import '../auth/login_screen.dart';
import '../coin/coin_shop_screen.dart';
import '../novel_detail/novel_detail_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: AppColors.background,
        elevation: AppElevation.none,
        scrolledUnderElevation: AppElevation.card,
        titleSpacing: AppSpacing.md,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: AppRadius.roundedMd,
              ),
              child: const Icon(
                Icons.auto_stories,
                size: AppIconSize.sm,
                color: AppColors.surface,
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Text('Luminovels', style: AppTypography.h2),
          ],
        ),
        actions: [
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, authState) {
              if (authState is Authenticated) {
                return Padding(
                  padding: const EdgeInsets.only(right: AppSpacing.md),
                  child: CoinBadge(
                    coins: authState.user.coinBalance,
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => const CoinShopScreen(),
                        ),
                      );
                    },
                  ),
                );
              }
              return TextButton(
                onPressed: () {
                  Navigator.of(context).push(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                  );
                },
                child: Text(
                  'Đăng nhập',
                  style: AppTypography.button.copyWith(
                    color: AppColors.primary,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
        backgroundColor: AppColors.surface,
        onRefresh: () async {
          context.read<NovelBloc>().add(FetchHomeDataEvent());
        },
        child: BlocBuilder<NovelBloc, NovelState>(
          builder: (context, state) {
            if (state is NovelLoading || state is NovelInitial) {
              return const Center(
                child: CircularProgressIndicator(color: AppColors.primary),
              );
            }

            if (state is NovelError) {
              return Center(
                child: Padding(
                  padding: AppSpacing.paddingLg,
                  child: Container(
                    padding: AppSpacing.paddingLg,
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: AppRadius.roundedLg,
                      border: Border.all(color: AppColors.divider, width: 0.8),
                      boxShadow: AppElevation.shadowCard,
                    ),
                    child: SingleChildScrollView(
                      physics: const BouncingScrollPhysics(),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.wifi_off_outlined,
                            size: AppIconSize.xl,
                            color: AppColors.disabled,
                          ),
                          const SizedBox(height: AppSpacing.md),
                          Text(
                            state.message,
                            textAlign: TextAlign.center,
                            maxLines: 4,
                            overflow: TextOverflow.ellipsis,
                            style: AppTypography.bodyM.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.md),
                          ElevatedButton(
                            onPressed: () {
                              context.read<NovelBloc>().add(FetchHomeDataEvent());
                            },
                            child: const Text('Thử lại'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            }

            if (state is NovelHomeLoaded) {
              return CustomScrollView(
                slivers: [
                  // 3-Novel Showcase Hero Banner
                  HomeBannerCarousel(
                    novels: (state.featuredNovels.isNotEmpty
                            ? state.featuredNovels
                            : state.latestNovels)
                        .take(3)
                        .toList(),
                  ),

                  // Small 2x2 Category Grid
                  if (state.categories.isNotEmpty)
                    SliverPadding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.md,
                        AppSpacing.xs,
                        AppSpacing.md,
                        AppSpacing.sm,
                      ),
                      sliver: SliverGrid(
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 2,
                          childAspectRatio: 3.4,
                          crossAxisSpacing: AppSpacing.sm,
                          mainAxisSpacing: AppSpacing.sm,
                        ),
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final cat = state.categories[index];
                            final isSelected =
                                state.selectedCategory == cat.name;
                            return _buildCategoryTile(
                              context,
                              cat,
                              isSelected,
                            );
                          },
                          childCount: state.categories.length > 4
                              ? 4
                              : state.categories.length,
                        ),
                      ),
                    ),

                  // Section Title: Khám phá tác phẩm
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(
                        AppSpacing.md,
                        AppSpacing.sm,
                        AppSpacing.md,
                        AppSpacing.xs,
                      ),
                      child: Row(
                        children: [
                          Text('Khám phá tác phẩm', style: AppTypography.h2),
                          const Spacer(),
                          Text(
                            '${state.latestNovels.length} truyện',
                            style: AppTypography.caption,
                          ),
                        ],
                      ),
                    ),
                  ),

                  // 2-column Grid
                  state.latestNovels.isEmpty
                      ? SliverFillRemaining(
                          child: Center(
                            child: Padding(
                              padding: AppSpacing.paddingLg,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(
                                    Icons.auto_stories_outlined,
                                    size: AppIconSize.xl,
                                    color: AppColors.disabled,
                                  ),
                                  const SizedBox(height: AppSpacing.md),
                                  Text(
                                    'Chưa có truyện nào trong danh mục này',
                                    style: AppTypography.bodyM.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        )
                      : SliverPadding(
                          padding: AppSpacing.paddingMd,
                          sliver: SliverGrid(
                            gridDelegate:
                                const SliverGridDelegateWithFixedCrossAxisCount(
                                  crossAxisCount: 2,
                                  childAspectRatio: 0.62,
                                  crossAxisSpacing: AppSpacing.md,
                                  mainAxisSpacing: AppSpacing.md,
                                ),
                            delegate: SliverChildBuilderDelegate((
                              context,
                              index,
                            ) {
                              final novel = state.latestNovels[index];
                              return NovelCard(
                                novel: novel,
                                onTap: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) =>
                                          NovelDetailScreen(novelId: novel.id),
                                    ),
                                  );
                                },
                              );
                            }, childCount: state.latestNovels.length),
                          ),
                        ),
                ],
              );
            }

            return const SizedBox();
          },
        ),
      ),
    );
  }

  Widget _buildCategoryTile(
    BuildContext context,
    CategoryModel category,
    bool isSelected,
  ) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          context.read<NovelBloc>().add(
                SelectCategoryEvent(isSelected ? null : category.name),
              );
        },
        borderRadius: AppRadius.roundedMd,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
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
          child: Row(
            children: [
              Icon(
                _getCategoryIcon(category.name),
                size: 15,
                color: isSelected ? Colors.white : AppColors.primary,
              ),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  category.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                    color: isSelected ? Colors.white : AppColors.textDark,
                  ),
                ),
              ),
              if (isSelected)
                const Icon(
                  Icons.check_rounded,
                  size: 13,
                  color: Colors.white,
                ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _getCategoryIcon(String categoryName) {
    final lower = categoryName.toLowerCase();
    if (lower.contains('fantasy') ||
        lower.contains('huyền huyễn') ||
        lower.contains('tiên hiệp')) {
      return Icons.auto_awesome_outlined;
    }
    if (lower.contains('school') || lower.contains('học đường')) {
      return Icons.school_outlined;
    }
    if (lower.contains('romance') || lower.contains('ngôn tình')) {
      return Icons.favorite_border_rounded;
    }
    if (lower.contains('science') || lower.contains('khoa huyễn')) {
      return Icons.rocket_launch_outlined;
    }
    if (lower.contains('adventure') || lower.contains('phiêu lưu')) {
      return Icons.explore_outlined;
    }
    if (lower.contains('action') ||
        lower.contains('hành động') ||
        lower.contains('kiếm hiệp')) {
      return Icons.flash_on_outlined;
    }
    if (lower.contains('comedy') || lower.contains('hài')) {
      return Icons.sentiment_satisfied_alt_outlined;
    }
    if (lower.contains('mystery') ||
        lower.contains('bí ẩn') ||
        lower.contains('trinh thám')) {
      return Icons.search_outlined;
    }
    return Icons.category_outlined;
  }
}



// =============================================================================
// Home Image Banner (Taking 3 novel images)
// =============================================================================
class HomeBannerCarousel extends StatefulWidget {
  final List<NovelModel> novels;

  const HomeBannerCarousel({
    super.key,
    required this.novels,
  });

  @override
  State<HomeBannerCarousel> createState() => _HomeBannerCarouselState();
}

class _HomeBannerCarouselState extends State<HomeBannerCarousel> {
  late final PageController _pageController;
  int _currentPage = 0;
  Timer? _autoScrollTimer;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    _startAutoScroll();
  }

  void _startAutoScroll() {
    if (widget.novels.length <= 1) return;
    _autoScrollTimer?.cancel();
    _autoScrollTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (!mounted || !_pageController.hasClients) return;
      final nextPage = (_currentPage + 1) % widget.novels.length;
      _pageController.animateToPage(
        nextPage,
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    });
  }

  @override
  void dispose() {
    _autoScrollTimer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.novels.isEmpty) {
      return const SliverToBoxAdapter(child: SizedBox.shrink());
    }

    final count = widget.novels.length;

    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.md,
          AppSpacing.xs,
          AppSpacing.md,
          AppSpacing.sm,
        ),
        child: SizedBox(
          height: 155,
          child: Stack(
            children: [
              PageView.builder(
                controller: _pageController,
                itemCount: count,
                onPageChanged: (index) {
                  setState(() {
                    _currentPage = index;
                  });
                },
                itemBuilder: (context, index) {
                  final novel = widget.novels[index];

                  return GestureDetector(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => NovelDetailScreen(novelId: novel.id),
                        ),
                      );
                    },
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 2),
                      decoration: BoxDecoration(
                        borderRadius: AppRadius.roundedLg,
                        boxShadow: AppElevation.shadowCard,
                      ),
                      child: ClipRRect(
                        borderRadius: AppRadius.roundedLg,
                        child: Stack(
                          fit: StackFit.expand,
                          children: [
                            AppNetworkImage(
                              imageUrl: novel.coverImageUrl,
                              fit: BoxFit.cover,
                              memCacheWidth: 600,
                              memCacheHeight: 320,
                            ),
                            Positioned(
                              left: 0,
                              right: 0,
                              bottom: 0,
                              child: Container(
                                padding: const EdgeInsets.fromLTRB(14, 16, 60, 10),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    begin: Alignment.bottomCenter,
                                    end: Alignment.topCenter,
                                    colors: [
                                      Colors.black.withValues(alpha: 0.68),
                                      Colors.transparent,
                                    ],
                                  ),
                                ),
                                child: Text(
                                  novel.title,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                },
              ),

              // Bottom Indicator Dots
              if (count > 1)
                Positioned(
                  bottom: 10,
                  right: 16,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: List.generate(count, (dotIndex) {
                      final isActive = dotIndex == _currentPage;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 250),
                        margin: const EdgeInsets.symmetric(horizontal: 2.5),
                        width: isActive ? 16 : 6,
                        height: 5,
                        decoration: BoxDecoration(
                          color: isActive
                              ? Colors.white
                              : Colors.white.withValues(alpha: 0.4),
                          borderRadius: BorderRadius.circular(10),
                        ),
                      );
                    }),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

