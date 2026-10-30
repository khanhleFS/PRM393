import 'package:equatable/equatable.dart';

import '../../data/models/chapter_model.dart';

abstract class ReaderEvent extends Equatable {
  const ReaderEvent();
  @override
  List<Object?> get props => [];
}

class LoadChapterEvent extends ReaderEvent {
  final dynamic novelId;
  final dynamic chapterId;
  final String novelTitle;
  final List<ChapterModel>? chaptersList;

  const LoadChapterEvent({
    required this.novelId,
    required this.chapterId,
    required this.novelTitle,
    this.chaptersList,
  });

  @override
  List<Object?> get props => [novelId, chapterId, novelTitle, chaptersList];
}

class RetryChapterEvent extends ReaderEvent {
  const RetryChapterEvent();
}

class UnlockChapterEvent extends ReaderEvent {
  final dynamic novelId;
  final dynamic chapterId;

  const UnlockChapterEvent({required this.novelId, required this.chapterId});

  @override
  List<Object?> get props => [novelId, chapterId];
}

class ChangeFontSizeEvent extends ReaderEvent {
  final double fontSize;

  const ChangeFontSizeEvent(this.fontSize);

  @override
  List<Object?> get props => [fontSize];
}

class ChangeFontFamilyEvent extends ReaderEvent {
  final String fontFamily;

  const ChangeFontFamilyEvent(this.fontFamily);

  @override
  List<Object?> get props => [fontFamily];
}

class ChangeReaderThemeEvent extends ReaderEvent {
  final String readerTheme; // 'paper', 'night', 'light'

  const ChangeReaderThemeEvent(this.readerTheme);

  @override
  List<Object?> get props => [readerTheme];
}
