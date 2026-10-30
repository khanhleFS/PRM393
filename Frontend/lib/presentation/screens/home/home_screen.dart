import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_state.dart';
import '../../../bloc/novel/novel_bloc.dart';
import '../../../bloc/novel/novel_event.dart';
import '../../../bloc/novel/novel_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/theme/app_tokens.dart';
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
            Text(
              'Luminovels',
              style: AppTypography.h2,
            ),
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
                    MaterialPageRoute(
                      builder: (_) => const LoginScreen(),
                    ),
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
              );
            }

            if (state is NovelHomeLoaded) {
              return CustomScrollView(
                slivers: [
                  // Category chips
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: AppSpacing.xl2 + AppSpacing.sm, // 48
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                        scrollDirection: Axis.horizontal,
                        itemCount: state.categories.length + 1,
                        separatorBuilder: (_, _) => const SizedBox(width: AppSpacing.sm),
                        itemBuilder: (context, index) {
                          if (index == 0) {
                            final isSelected = state.selectedCategory == null;
                            return ChoiceChip(
                              label: const Text('Tất cả'),
                              selected: isSelected,
                              selectedColor: AppColors.primary,
                              backgroundColor: AppColors.surface,
                              shape: RoundedRectangleBorder(
                                borderRadius: AppRadius.roundedFull,
                                side: BorderSide(
                                  color: isSelected ? AppColors.primary : AppColors.divider,
                                  width: 0.8,
                                ),
                              ),
                              labelStyle: isSelected
                                  ? AppTypography.button.copyWith(fontSize: 12.5)
                                  : AppTypography.bodyS.copyWith(color: AppColors.textDark),
                              onSelected: (_) {
                                context.read<NovelBloc>().add(const SelectCategoryEvent(null));
                              },
                            );
                          }
                          final cat = state.categories[index - 1];
                          final isSelected = state.selectedCategory == cat.slug ||
                              state.selectedCategory == cat.name;
                          return ChoiceChip(
                            label: Text(cat.name),
                            selected: isSelected,
                            selectedColor: AppColors.primary,
                            backgroundColor: AppColors.surface,
                            shape: RoundedRectangleBorder(
                              borderRadius: AppRadius.roundedFull,
                              side: BorderSide(
                                color: isSelected ? AppColors.primary : AppColors.divider,
                                width: 0.8,
                              ),
                            ),
                            labelStyle: isSelected
                                ? AppTypography.button.copyWith(fontSize: 12.5)
                                : AppTypography.bodyS.copyWith(color: AppColors.textDark),
                            onSelected: (_) {
                              context.read<NovelBloc>().add(SelectCategoryEvent(cat.name));
                            },
                          );
                        },
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
                          Text(
                            'Khám phá tác phẩm',
                            style: AppTypography.h2,
                          ),
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
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 0.62,
                              crossAxisSpacing: AppSpacing.md,
                              mainAxisSpacing: AppSpacing.md,
                            ),
                            delegate: SliverChildBuilderDelegate(
                              (context, index) {
                                final novel = state.latestNovels[index];
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
                              childCount: state.latestNovels.length,
                            ),
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
}
