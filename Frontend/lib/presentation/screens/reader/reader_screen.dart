import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../bloc/auth/auth_bloc.dart';
import '../../../bloc/auth/auth_state.dart';
import '../../../bloc/bookmark/bookmark_bloc.dart';
import '../../../bloc/bookmark/bookmark_event.dart';
import '../../../bloc/reader/reader_bloc.dart';
import '../../../bloc/reader/reader_event.dart';
import '../../../bloc/reader/reader_state.dart';
import '../../../core/constants/app_colors.dart';
import '../../../data/models/chapter_model.dart';
import '../../../data/repositories/chapter_repository.dart';
import '../auth/login_screen.dart';
import '../coin/coin_shop_screen.dart';

class ReaderScreen extends StatelessWidget {
  final dynamic novelId;
  final dynamic chapterId;
  final String novelTitle;
  final List<ChapterModel>? chaptersList;

  const ReaderScreen({
    super.key,
    required this.novelId,
    required this.chapterId,
    required this.novelTitle,
    this.chaptersList,
  });

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (context) => ReaderBloc(
        chapterRepository: context.read<ChapterRepository>(),
      )..add(
          LoadChapterEvent(
            novelId: novelId,
            chapterId: chapterId,
            novelTitle: novelTitle,
            chaptersList: chaptersList,
          ),
        ),
      child: const _ReaderView(),
    );
  }
}

class _ReaderView extends StatefulWidget {
  const _ReaderView();

  @override
  State<_ReaderView> createState() => _ReaderViewState();
}

class _ReaderViewState extends State<_ReaderView> {
  final ScrollController _scrollController = ScrollController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToTop() {
    if (_scrollController.hasClients) {
      _scrollController.jumpTo(0);
    }
  }

  void _showSettingsModal(BuildContext context, ReaderLoaded state) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (modalCtx) {
        return StatefulBuilder(
          builder: (ctx, setModalState) {
            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Cài đặt giao diện đọc',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Font Size
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Cỡ chữ',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                      ),
                      Row(
                        children: [
                          IconButton(
                            icon: const Icon(Icons.remove_circle_outline),
                            onPressed: state.fontSize > 12
                                ? () {
                                    context.read<ReaderBloc>().add(
                                          ChangeFontSizeEvent(state.fontSize - 2),
                                        );
                                    Navigator.pop(modalCtx);
                                  }
                                : null,
                          ),
                          Text(
                            '${state.fontSize.toInt()} px',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                          IconButton(
                            icon: const Icon(Icons.add_circle_outline),
                            onPressed: state.fontSize < 32
                                ? () {
                                    context.read<ReaderBloc>().add(
                                          ChangeFontSizeEvent(state.fontSize + 2),
                                        );
                                    Navigator.pop(modalCtx);
                                  }
                                : null,
                          ),
                        ],
                      ),
                    ],
                  ),
                  const Divider(),

                  // Font Family Toggle (Literata Serif vs Plus Jakarta Sans)
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Kiểu chữ',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                      ),
                      SegmentedButton<String>(
                        segments: const [
                          ButtonSegment(
                            value: 'Literata',
                            label: Text('Có chân (Serif)'),
                          ),
                          ButtonSegment(
                            value: 'Plus Jakarta Sans',
                            label: Text('Không chân (Sans)'),
                          ),
                        ],
                        selected: {state.fontFamily},
                        onSelectionChanged: (val) {
                          context.read<ReaderBloc>().add(
                                ChangeFontFamilyEvent(val.first),
                              );
                          Navigator.pop(modalCtx);
                        },
                      ),
                    ],
                  ),
                  const Divider(),

                  // Reader Themes: Paper, Night, Light
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Màu nền',
                        style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                      ),
                      Row(
                        children: [
                          _buildThemeCircle(
                            context: context,
                            label: 'Giấy ngà',
                            color: AppColors.paperBg,
                            borderColor: Colors.amber.shade700,
                            isSelected: state.readerTheme == 'paper',
                            onTap: () {
                              context.read<ReaderBloc>().add(
                                    const ChangeReaderThemeEvent('paper'),
                                  );
                              Navigator.pop(modalCtx);
                            },
                          ),
                          const SizedBox(width: 12),
                          _buildThemeCircle(
                            context: context,
                            label: 'Ban đêm',
                            color: AppColors.nightBg,
                            borderColor: Colors.grey.shade600,
                            isSelected: state.readerTheme == 'night',
                            onTap: () {
                              context.read<ReaderBloc>().add(
                                    const ChangeReaderThemeEvent('night'),
                                  );
                              Navigator.pop(modalCtx);
                            },
                          ),
                          const SizedBox(width: 12),
                          _buildThemeCircle(
                            context: context,
                            label: 'Trắng',
                            color: Colors.white,
                            borderColor: Colors.grey.shade400,
                            isSelected: state.readerTheme == 'light',
                            onTap: () {
                              context.read<ReaderBloc>().add(
                                    const ChangeReaderThemeEvent('light'),
                                  );
                              Navigator.pop(modalCtx);
                            },
                          ),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildThemeCircle({
    required BuildContext context,
    required String label,
    required Color color,
    required Color borderColor,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: color,
          shape: BoxShape.circle,
          border: Border.all(
            color: isSelected ? AppColors.primary : borderColor,
            width: isSelected ? 3 : 1.5,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<ReaderBloc, ReaderState>(
      listener: (context, state) {
        if (state is ReaderLoaded) {
          // Sync reading progress with BookmarkBloc
          context.read<BookmarkBloc>().add(
                UpdateReadingProgressEvent(
                  novelId: state.chapter.novelId,
                  lastChapterId: state.chapter.id,
                ),
              );
        } else if (state is ReaderError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(state.message),
              backgroundColor: Colors.red,
            ),
          );
        }
      },
      builder: (context, state) {
        if (state is ReaderLoading || state is ReaderInitial) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(color: AppColors.primary),
            ),
          );
        }

        if (state is ReaderLoaded) {
          final chapter = state.chapter;

          // Theme colors
          Color bgColor;
          Color textColor;
          if (state.readerTheme == 'night') {
            bgColor = AppColors.nightBg;
            textColor = AppColors.nightText;
          } else if (state.readerTheme == 'light') {
            bgColor = Colors.white;
            textColor = AppColors.textPrimary;
          } else {
            bgColor = AppColors.paperBg;
            textColor = AppColors.paperText;
          }

          TextStyle readingTextStyle;
          if (state.fontFamily == 'Plus Jakarta Sans') {
            readingTextStyle = GoogleFonts.plusJakartaSans(
              fontSize: state.fontSize,
              color: textColor,
              height: 1.8,
            );
          } else {
            readingTextStyle = GoogleFonts.literata(
              fontSize: state.fontSize,
              color: textColor,
              height: 1.8,
            );
          }

          return Scaffold(
            backgroundColor: bgColor,
            appBar: AppBar(
              backgroundColor: bgColor,
              elevation: 0,
              iconTheme: IconThemeData(color: textColor),
              title: Text(
                state.novelTitle,
                style: TextStyle(
                  color: textColor,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              actions: [
                IconButton(
                  icon: const Icon(Icons.format_size),
                  onPressed: () => _showSettingsModal(context, state),
                ),
              ],
            ),
            body: Column(
              children: [
                Expanded(
                  child: SingleChildScrollView(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Chapter Title
                        Text(
                          chapter.title,
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: state.fontSize + 4,
                            fontWeight: FontWeight.w800,
                            color: textColor,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          'Chương ${chapter.chapterNumber}',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            fontSize: 13,
                            color: textColor.withValues(alpha: 0.6),
                          ),
                        ),
                        const SizedBox(height: 24),

                        // If Chapter is locked: Show unlock card
                        if (chapter.isLocked) ...[
                          _buildLockedChapterCard(context, chapter, textColor, bgColor),
                        ] else ...[
                          // Anti-copy Protected Text
                          SelectionContainer.disabled(
                            child: Text(
                              chapter.content?.isNotEmpty ?? false
                                  ? chapter.content!
                                  : 'Nội dung chương trống.',
                              style: readingTextStyle,
                            ),
                          ),
                        ],
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),

                // Bottom Navigation Bar for previous/next chapters
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                  decoration: BoxDecoration(
                    color: bgColor,
                    border: Border(
                      top: BorderSide(color: textColor.withValues(alpha: 0.1)),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: textColor.withValues(alpha: 0.1),
                          foregroundColor: textColor,
                          elevation: 0,
                        ),
                        icon: const Icon(Icons.arrow_back, size: 16),
                        label: const Text('Chương trước'),
                        onPressed: state.prevChapter != null
                            ? () {
                                _scrollToTop();
                                context.read<ReaderBloc>().add(
                                      LoadChapterEvent(
                                        novelId: state.prevChapter!.novelId,
                                        chapterId: state.prevChapter!.id,
                                        novelTitle: state.novelTitle,
                                        chaptersList: state.chaptersList,
                                      ),
                                    );
                              }
                            : null,
                      ),
                      ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                        ),
                        icon: const Icon(Icons.arrow_forward, size: 16),
                        label: const Text('Chương sau'),
                        onPressed: state.nextChapter != null
                            ? () {
                                _scrollToTop();
                                context.read<ReaderBloc>().add(
                                      LoadChapterEvent(
                                        novelId: state.nextChapter!.novelId,
                                        chapterId: state.nextChapter!.id,
                                        novelTitle: state.novelTitle,
                                        chaptersList: state.chaptersList,
                                      ),
                                    );
                              }
                            : null,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        }

        return const Scaffold(body: SizedBox());
      },
    );
  }

  Widget _buildLockedChapterCard(
    BuildContext context,
    ChapterModel chapter,
    Color textColor,
    Color bgColor,
  ) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: textColor.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.coinGold.withValues(alpha: 0.4)),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.coinGold.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.lock,
              size: 36,
              color: AppColors.coinGold,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Chương truyện VIP có tính phí',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Chương này được mã hóa bảo vệ bản quyền. Bạn cần dùng ${chapter.coinPrice} xu để mở khóa và đọc toàn bộ nội dung.',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: textColor.withValues(alpha: 0.7),
              height: 1.4,
            ),
          ),
          const SizedBox(height: 20),
          BlocBuilder<AuthBloc, AuthState>(
            builder: (context, authState) {
              if (authState is Authenticated) {
                final balance = authState.user.coinBalance;
                final canAfford = balance >= chapter.coinPrice;

                return Column(
                  children: [
                    Text(
                      'Số dư của bạn: $balance xu',
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: 16),
                    if (canAfford)
                      SizedBox(
                        width: double.infinity,
                        height: 48,
                        child: ElevatedButton(
                          onPressed: () {
                            context.read<ReaderBloc>().add(
                                  UnlockChapterEvent(
                                    novelId: chapter.novelId,
                                    chapterId: chapter.id,
                                  ),
                                );
                          },
                          child: Text(
                            'Mở khóa ngay (${chapter.coinPrice} xu)',
                            style: const TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      )
                    else
                      Column(
                        children: [
                          const Text(
                            'Số xu hiện tại không đủ để mở khóa chương này',
                            style: TextStyle(color: Colors.red, fontSize: 13),
                          ),
                          const SizedBox(height: 12),
                          SizedBox(
                            width: double.infinity,
                            height: 48,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.coinGold,
                              ),
                              onPressed: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const CoinShopScreen(),
                                  ),
                                );
                              },
                              child: const Text('Nạp thêm xu'),
                            ),
                          ),
                        ],
                      ),
                  ],
                );
              }

              return Column(
                children: [
                  const Text(
                    'Bạn cần đăng nhập tài khoản để mở khóa chương truyện',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (_) => const LoginScreen()),
                      );
                    },
                    child: const Text('Đăng nhập ngay'),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }
}
