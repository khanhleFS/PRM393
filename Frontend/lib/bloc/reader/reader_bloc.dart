import 'package:flutter_bloc/flutter_bloc.dart';

import '../../core/storage/local_storage.dart';
import '../../data/models/chapter_model.dart';
import '../../data/repositories/chapter_repository.dart';
import 'reader_event.dart';
import 'reader_state.dart';

class ReaderBloc extends Bloc<ReaderEvent, ReaderState> {
  final ChapterRepository chapterRepository;
  final void Function()? onChapterUnlocked;

  LoadChapterEvent? _lastLoadEvent;

  LoadChapterEvent? get lastLoadEvent => _lastLoadEvent;

  ReaderBloc({required this.chapterRepository, this.onChapterUnlocked})
    : super(ReaderInitial()) {
    on<LoadChapterEvent>(_onLoadChapter);
    on<RetryChapterEvent>(_onRetryChapter);
    on<UnlockChapterEvent>(_onUnlockChapter);
    on<ChangeFontSizeEvent>(_onChangeFontSize);
    on<ChangeFontFamilyEvent>(_onChangeFontFamily);
    on<ChangeReaderThemeEvent>(_onChangeReaderTheme);
  }

  Future<void> _onLoadChapter(
    LoadChapterEvent event,
    Emitter<ReaderState> emit,
  ) async {
    // 1. Record latest request before calling repository
    _lastLoadEvent = event;
    emit(ReaderLoading());

    // Prepare chapters list
    List<ChapterModel> chapters = event.chaptersList ?? [];
    if (chapters.isEmpty) {
      try {
        chapters = await chapterRepository.getChapters(event.novelId);
      } catch (_) {}
    }

    final fontSize = LocalStorage.getFontSize();
    final fontFamily = LocalStorage.getFontFamily();
    final readerTheme = LocalStorage.getReaderTheme();

    ChapterModel? chapter;
    try {
      chapter = await chapterRepository.readChapter(
        event.novelId,
        event.chapterId,
      );
    } on ChapterLockedException {
      // Find metadata from chapter list
      ChapterModel? target;
      if (chapters.isNotEmpty) {
        try {
          target = chapters.firstWhere(
            (c) => c.id.toString() == event.chapterId.toString(),
          );
        } catch (_) {
          target = null;
        }
      }
      chapter = ChapterModel(
        id: event.chapterId is int
            ? event.chapterId
            : int.tryParse(event.chapterId.toString()) ?? 0,
        novelId: event.novelId is int
            ? event.novelId
            : int.tryParse(event.novelId.toString()) ?? 0,
        chapterNumber: target?.chapterNumber ?? 1,
        title: target?.title ?? 'Chương',
        slug: target?.slug ?? '',
        status: 'LOCKED',
        coinPrice: target?.coinPrice ?? 10,
      );
    } catch (e) {
      emit(ReaderError(e.toString().replaceAll('Exception: ', '')));
      return;
    }

    // Find previous and next chapters if chapter list is provided
    ChapterModel? prev;
    ChapterModel? next;
    if (chapters.isNotEmpty) {
      final currentIndex = chapters.indexWhere(
        (c) => c.chapterNumber == chapter!.chapterNumber,
      );
      if (currentIndex > 0) {
        prev = chapters[currentIndex - 1];
      }
      if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
        next = chapters[currentIndex + 1];
      }
    }

    emit(
      ReaderLoaded(
        chapter: chapter,
        novelTitle: event.novelTitle,
        fontSize: fontSize,
        fontFamily: fontFamily,
        readerTheme: readerTheme,
        chaptersList: chapters,
        prevChapter: prev,
        nextChapter: next,
      ),
    );
  }

  Future<void> _onRetryChapter(
    RetryChapterEvent event,
    Emitter<ReaderState> emit,
  ) async {
    if (_lastLoadEvent != null) {
      await _onLoadChapter(_lastLoadEvent!, emit);
    }
  }

  Future<void> _onUnlockChapter(
    UnlockChapterEvent event,
    Emitter<ReaderState> emit,
  ) async {
    final ChapterUnlockResponseModel unlockResult;
    try {
      // 1. Execute unlock transaction
      unlockResult = await chapterRepository.unlockChapter(
        event.novelId,
        event.chapterId,
      );
    } catch (e) {
      // Unlock transaction failed: do NOT trigger sync callback
      emit(ReaderError(e.toString().replaceAll('Exception: ', '')));
      return;
    }

    // 2. Unlock transaction succeeded: trigger coin balance sync immediately
    onChapterUnlocked?.call();

    // 3. Update _lastLoadEvent so retrying will only re-fetch chapter content,
    // without re-invoking unlock transaction.
    if (state is ReaderLoaded) {
      final current = state as ReaderLoaded;
      _lastLoadEvent = LoadChapterEvent(
        novelId: event.novelId,
        chapterId: event.chapterId,
        novelTitle: current.novelTitle,
        chaptersList: current.chaptersList,
      );
    } else if (_lastLoadEvent != null) {
      _lastLoadEvent = LoadChapterEvent(
        novelId: event.novelId,
        chapterId: event.chapterId,
        novelTitle: _lastLoadEvent!.novelTitle,
        chaptersList: _lastLoadEvent!.chaptersList,
      );
    }

    // 4. Reload chapter content after unlock
    try {
      final chapter = await chapterRepository.readChapter(
        event.novelId,
        event.chapterId,
      );

      if (state is ReaderLoaded) {
        final current = state as ReaderLoaded;
        emit(current.copyWith(chapter: chapter));
      } else if (_lastLoadEvent != null) {
        await _onLoadChapter(_lastLoadEvent!, emit);
      } else {
        emit(ReaderUnlockSuccess(unlockResult));
      }
    } catch (e) {
      emit(ReaderError(e.toString().replaceAll('Exception: ', '')));
    }
  }

  Future<void> _onChangeFontSize(
    ChangeFontSizeEvent event,
    Emitter<ReaderState> emit,
  ) async {
    await LocalStorage.saveFontSize(event.fontSize);
    if (state is ReaderLoaded) {
      final current = state as ReaderLoaded;
      emit(current.copyWith(fontSize: event.fontSize));
    }
  }

  Future<void> _onChangeFontFamily(
    ChangeFontFamilyEvent event,
    Emitter<ReaderState> emit,
  ) async {
    await LocalStorage.saveFontFamily(event.fontFamily);
    if (state is ReaderLoaded) {
      final current = state as ReaderLoaded;
      emit(current.copyWith(fontFamily: event.fontFamily));
    }
  }

  Future<void> _onChangeReaderTheme(
    ChangeReaderThemeEvent event,
    Emitter<ReaderState> emit,
  ) async {
    await LocalStorage.saveReaderTheme(event.readerTheme);
    if (state is ReaderLoaded) {
      final current = state as ReaderLoaded;
      emit(current.copyWith(readerTheme: event.readerTheme));
    }
  }
}
