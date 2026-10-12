import 'package:device_preview_plus/device_preview_plus.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'bloc/auth/auth_bloc.dart';
import 'bloc/auth/auth_event.dart';
import 'bloc/bookmark/bookmark_bloc.dart';
import 'bloc/novel/novel_bloc.dart';
import 'bloc/novel/novel_event.dart';
import 'core/constants/api_endpoints.dart';
import 'core/storage/local_storage.dart';
import 'core/theme/app_theme.dart';
import 'data/repositories/auth_repository.dart';
import 'data/repositories/bookmark_repository.dart';
import 'data/repositories/chapter_repository.dart';
import 'data/repositories/coin_repository.dart';
import 'data/repositories/novel_repository.dart';
import 'presentation/screens/splash/splash_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize storage & dynamic endpoint configurations
  await LocalStorage.init();
  await ApiEndpoints.init();

  runApp(
    DevicePreview(
      enabled: !kReleaseMode, // Enable preview in debug/dev mode
      builder: (context) => const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiRepositoryProvider(
      providers: [
        RepositoryProvider(create: (_) => AuthRepository()),
        RepositoryProvider(create: (_) => NovelRepository()),
        RepositoryProvider(create: (_) => ChapterRepository()),
        RepositoryProvider(create: (_) => BookmarkRepository()),
        RepositoryProvider(create: (_) => CoinRepository()),
      ],
      child: MultiBlocProvider(
        providers: [
          BlocProvider(
            create: (context) => AuthBloc(
              authRepository: context.read<AuthRepository>(),
            )..add(CheckAuthStatusEvent()),
          ),
          BlocProvider(
            create: (context) => NovelBloc(
              novelRepository: context.read<NovelRepository>(),
            )..add(FetchHomeDataEvent()),
          ),
          BlocProvider(
            create: (context) => BookmarkBloc(
              bookmarkRepository: context.read<BookmarkRepository>(),
            ),
          ),
        ],
        child: MaterialApp(
          title: 'Luminovels',
          debugShowCheckedModeBanner: false,
          locale: DevicePreview.locale(context),
          builder: DevicePreview.appBuilder,
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: ThemeMode.light,
          home: const SplashScreen(),
        ),
      ),
    );
  }
}
