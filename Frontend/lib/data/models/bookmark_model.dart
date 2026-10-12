class BookmarkModel {
  final String id;
  final int novelId;
  final String novelTitle;
  final String novelSlug;
  final String coverImageUrl;
  final String authorName;
  final int? lastChapterId;
  final int? lastChapterNumber;
  final String? lastChapterTitle;
  final String? lastChapterSlug;
  final int totalChapters;
  final bool isFavorite;
  final int readingProgressPercent;

  BookmarkModel({
    required this.id,
    required this.novelId,
    required this.novelTitle,
    required this.novelSlug,
    required this.coverImageUrl,
    required this.authorName,
    this.lastChapterId,
    this.lastChapterNumber,
    this.lastChapterTitle,
    this.lastChapterSlug,
    this.totalChapters = 0,
    this.isFavorite = true,
    this.readingProgressPercent = 0,
  });

  factory BookmarkModel.fromJson(Map<String, dynamic> json) {
    return BookmarkModel(
      id: json['id']?.toString() ?? '',
      novelId: (json['novelId'] as num?)?.toInt() ?? 0,
      novelTitle: json['novelTitle']?.toString() ?? '',
      novelSlug: json['novelSlug']?.toString() ?? '',
      coverImageUrl: json['coverImageUrl']?.toString() ?? '',
      authorName: json['authorName']?.toString() ?? '',
      lastChapterId: (json['lastChapterId'] as num?)?.toInt(),
      lastChapterNumber: (json['lastChapterNumber'] as num?)?.toInt(),
      lastChapterTitle: json['lastChapterTitle']?.toString(),
      lastChapterSlug: json['lastChapterSlug']?.toString(),
      totalChapters: (json['totalChapters'] as num?)?.toInt() ?? 0,
      isFavorite: json['isFavorite'] as bool? ?? true,
      readingProgressPercent: (json['readingProgressPercent'] as num?)?.toInt() ?? 0,
    );
  }
}
