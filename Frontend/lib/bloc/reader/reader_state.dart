import 'package:equatable/equatable.dart';
import '../../data/models/chapter_model.dart';

abstract class ReaderState extends Equatable {
  const ReaderState();
  @override
  List<Object?> get props => [];
}

class ReaderInitial extends ReaderState {}

class ReaderLoading extends ReaderState {}

class ReaderLoaded extends ReaderState {
  final ChapterModel chapter;
  final String novelTitle;
  final double fontSize;
  final String fontFamily;
  final String readerTheme; // 'paper', 'night', 'light'
  final List<ChapterModel> chaptersList;
  final ChapterModel? prevChapter;
  final ChapterModel? nextChapter;

  const ReaderLoaded({
    required this.chapter,
    required this.novelTitle,
    required this.fontSize,
    required this.fontFamily,
    required this.readerTheme,
    this.chaptersList = const [],
    this.prevChapter,
    this.nextChapter,
  });

  ReaderLoaded copyWith({
    ChapterModel? chapter,
    String? novelTitle,
    double? fontSize,
    String? fontFamily,
    String? readerTheme,
    List<ChapterModel>? chaptersList,
    ChapterModel? prevChapter,
    ChapterModel? nextChapter,
  }) {
    return ReaderLoaded(
      chapter: chapter ?? this.chapter,
      novelTitle: novelTitle ?? this.novelTitle,
      fontSize: fontSize ?? this.fontSize,
      fontFamily: fontFamily ?? this.fontFamily,
      readerTheme: readerTheme ?? this.readerTheme,
      chaptersList: chaptersList ?? this.chaptersList,
      prevChapter: prevChapter ?? this.prevChapter,
      nextChapter: nextChapter ?? this.nextChapter,
    );
  }

  @override
  List<Object?> get props => [
        chapter,
        novelTitle,
        fontSize,
        fontFamily,
        readerTheme,
        chaptersList,
        prevChapter,
        nextChapter,
      ];
}

class ReaderUnlockSuccess extends ReaderState {
  final ChapterUnlockResponseModel result;

  const ReaderUnlockSuccess(this.result);

  @override
  List<Object?> get props => [result];
}

class ReaderError extends ReaderState {
  final String message;

  const ReaderError(this.message);

  @override
  List<Object?> get props => [message];
}
