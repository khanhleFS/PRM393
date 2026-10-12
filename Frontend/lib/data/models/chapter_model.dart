class ChapterModel {
  final int id;
  final int novelId;
  final int chapterNumber;
  final String title;
  final String slug;
  final String? content;
  final String? encryptedData;
  final String? iv;
  final String? audioUrl;
  final String status; // 'FREE', 'LOCKED', 'UNLOCKED'
  final int coinPrice;
  final int viewCount;

  ChapterModel({
    required this.id,
    required this.novelId,
    required this.chapterNumber,
    required this.title,
    required this.slug,
    this.content,
    this.encryptedData,
    this.iv,
    this.audioUrl,
    required this.status,
    this.coinPrice = 0,
    this.viewCount = 0,
  });

  bool get isLocked => status.toUpperCase() == 'LOCKED';
  bool get isFree => coinPrice == 0 || status.toUpperCase() == 'FREE';

  factory ChapterModel.fromJson(Map<String, dynamic> json) {
    return ChapterModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      novelId: (json['novelId'] as num?)?.toInt() ?? 0,
      chapterNumber: (json['chapterNumber'] as num?)?.toInt() ?? 1,
      title: json['title']?.toString() ?? 'Chương ${json['chapterNumber'] ?? 1}',
      slug: json['slug']?.toString() ?? '',
      content: json['content']?.toString(),
      encryptedData: json['encryptedData']?.toString(),
      iv: json['iv']?.toString(),
      audioUrl: json['audioUrl']?.toString(),
      status: json['status']?.toString() ?? 'FREE',
      coinPrice: (json['coinPrice'] as num?)?.toInt() ?? 0,
      viewCount: (json['viewCount'] as num?)?.toInt() ?? 0,
    );
  }
}

class ChapterUnlockResponseModel {
  final int chapterId;
  final int novelId;
  final int chapterNumber;
  final String title;
  final int coinsSpent;
  final int remainingCoins;

  ChapterUnlockResponseModel({
    required this.chapterId,
    required this.novelId,
    required this.chapterNumber,
    required this.title,
    required this.coinsSpent,
    required this.remainingCoins,
  });

  factory ChapterUnlockResponseModel.fromJson(Map<String, dynamic> json) {
    return ChapterUnlockResponseModel(
      chapterId: (json['chapterId'] as num?)?.toInt() ?? 0,
      novelId: (json['novelId'] as num?)?.toInt() ?? 0,
      chapterNumber: (json['chapterNumber'] as num?)?.toInt() ?? 0,
      title: json['title']?.toString() ?? '',
      coinsSpent: (json['coinsSpent'] as num?)?.toInt() ?? 0,
      remainingCoins: (json['remainingCoins'] as num?)?.toInt() ?? 0,
    );
  }
}
