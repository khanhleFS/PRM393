import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../bloc/bookmark/bookmark_bloc.dart';
import '../../bloc/bookmark/bookmark_event.dart';
import '../../core/constants/app_colors.dart';
import '../../core/theme/app_tokens.dart';
import 'home/home_screen.dart';
import 'library/library_screen.dart';
import 'profile/profile_screen.dart';
import 'search/search_screen.dart';

class MainNavScreen extends StatefulWidget {
  const MainNavScreen({super.key});

  @override
  State<MainNavScreen> createState() => _MainNavScreenState();
}

class _MainNavScreenState extends State<MainNavScreen> {
  int _currentIndex = 0;

  final List<Widget> _screens = const [
    HomeScreen(),
    SearchScreen(),
    LibraryScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          border: const Border(
            top: BorderSide(color: AppColors.divider, width: 0.8),
          ),
          boxShadow: AppElevation.shadowCard,
        ),
        child: NavigationBar(
          selectedIndex: _currentIndex,
          backgroundColor: AppColors.surface,
          elevation: AppElevation.none,
          indicatorColor: AppColors.primary.withValues(alpha: 0.12),
          onDestinationSelected: (index) {
            setState(() {
              _currentIndex = index;
            });
            if (index == 2) {
              context.read<BookmarkBloc>().add(FetchBookmarksEvent());
            }
          },
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.home_outlined, size: AppIconSize.md, color: AppColors.textDark),
              selectedIcon: Icon(Icons.home_rounded, size: AppIconSize.md, color: AppColors.primary),
              label: 'Khám phá',
            ),
            NavigationDestination(
              icon: Icon(Icons.search_outlined, size: AppIconSize.md, color: AppColors.textDark),
              selectedIcon: Icon(Icons.search_rounded, size: AppIconSize.md, color: AppColors.primary),
              label: 'Tìm kiếm',
            ),
            NavigationDestination(
              icon: Icon(Icons.bookmark_border_rounded, size: AppIconSize.md, color: AppColors.textDark),
              selectedIcon: Icon(Icons.bookmark_rounded, size: AppIconSize.md, color: AppColors.primary),
              label: 'Tủ sách',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_outline_rounded, size: AppIconSize.md, color: AppColors.textDark),
              selectedIcon: Icon(Icons.person_rounded, size: AppIconSize.md, color: AppColors.primary),
              label: 'Tài khoản',
            ),
          ],
        ),
      ),
    );
  }
}
