import 'package:equatable/equatable.dart';

abstract class BookmarkEvent extends Equatable {
  const BookmarkEvent();
  @override
  List<Object?> get props => [];
}

class FetchBookmarksEvent extends BookmarkEvent {}

class ToggleBookmarkEvent extends BookmarkEvent {
  final dynamic novelId;
  final bool isFavorite;

  const ToggleBookmarkEvent({
    required this.novelId,
    required this.isFavorite,
  });

  @override
  List<Object?> get props => [novelId, isFavorite];
}

class UpdateReadingProgressEvent extends BookmarkEvent {
  final dynamic novelId;
  final dynamic lastChapterId;
  final int? lastPage;
  final int? readingProgressPercent;

  const UpdateReadingProgressEvent({
    required this.novelId,
    required this.lastChapterId,
    this.lastPage,
    this.readingProgressPercent,
  });

  @override
  List<Object?> get props => [novelId, lastChapterId, lastPage, readingProgressPercent];
}
