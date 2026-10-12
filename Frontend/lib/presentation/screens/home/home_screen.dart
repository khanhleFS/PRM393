import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_state.dart';
import '../../../bloc/novel/novel_bloc.dart';
import '../../../bloc/novel/novel_event.dart';
import '../../../bloc/novel/novel_state.dart';
import '../../../core/constants/app_colors.dart';
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
      appBar: AppBar(
        titleSpacing: 16,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(
                color: AppColors.primary,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.auto_stories,
                size: 20,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 8),
            const Text(
              'Luminovels',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                color: AppColors.primaryDark,
                fontSize: 18,
              ),
            ),
          ],
        ),
        actions: [
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, authState) {
              if (authState is Authenticated) {
                return Padding(
                  padding: const EdgeInsets.only(right: 16),
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
                child: const Text(
                  'Đăng nhập',
                  style: TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primary,
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
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.wifi_off_outlined,
                        size: 48,
                        color: Colors.grey,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        state.message,
                        textAlign: TextAlign.center,
                        style: const TextStyle(color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          context.read<NovelBloc>().add(FetchHomeDataEvent());
                        },
                        child: const Text('Thử lại'),
                      ),
                    ],
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
                      height: 52,
                      child: ListView.separated(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        scrollDirection: Axis.horizontal,
                        itemCount: state.categories.length + 1,
                        separatorBuilder: (_, _) => const SizedBox(width: 8),
                        itemBuilder: (context, index) {
                          if (index == 0) {
                            final isSelected = state.selectedCategory == null;
                            return ChoiceChip(
                              label: const Text('Tất cả'),
                              selected: isSelected,
                              selectedColor: AppColors.primary,
                              labelStyle: TextStyle(
                                color: isSelected ? Colors.white : AppColors.textPrimary,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              ),
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
                            labelStyle: TextStyle(
                              color: isSelected ? Colors.white : AppColors.textPrimary,
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            ),
                            onSelected: (_) {
                              context.read<NovelBloc>().add(SelectCategoryEvent(cat.name));
                            },
                          );
                        },
                      ),
                    ),
                  ),

                  // Section Title: Danh sách truyện
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
                      child: Row(
                        children: [
                          const Text(
                            'Khám phá tác phẩm',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: AppColors.textPrimary,
                            ),
                          ),
                          const Spacer(),
                          Text(
                            '${state.latestNovels.length} truyện',
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // 2-column Grid
                  state.latestNovels.isEmpty
                      ? const SliverFillRemaining(
                          child: Center(
                            child: Text(
                              'Chưa có truyện nào trong danh mục này',
                              style: TextStyle(color: AppColors.textSecondary),
                            ),
                          ),
                        )
                      : SliverPadding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          sliver: SliverGrid(
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2,
                              childAspectRatio: 0.65,
                              crossAxisSpacing: 14,
                              mainAxisSpacing: 16,
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
