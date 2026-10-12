class NovelModel {
  final int id;
  final String title;
  final String slug;
  final String description;
  final String coverImageUrl;
  final String status;
  final int viewCount;
  final int chapterCount;
  final String? authorId;
  final String authorName;
  final List<String> categories;

  NovelModel({
    required this.id,
    required this.title,
    required this.slug,
    required this.description,
    required this.coverImageUrl,
    required this.status,
    this.viewCount = 0,
    this.chapterCount = 0,
    this.authorId,
    required this.authorName,
    this.categories = const [],
  });

  factory NovelModel.fromJson(Map<String, dynamic> json) {
    var rawCategories = json['categories'];
    List<String> parsedCategories = [];
    if (rawCategories is List) {
      parsedCategories = rawCategories.map((e) => e.toString()).toList();
    }

    return NovelModel(
      id: (json['id'] as num?)?.toInt() ?? 0,
      title: json['title']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      coverImageUrl: json['coverImageUrl']?.toString() ?? '',
      status: json['status']?.toString() ?? 'ONGOING',
      viewCount: (json['viewCount'] as num?)?.toInt() ?? 0,
      chapterCount: (json['chapterCount'] as num?)?.toInt() ?? 0,
      authorId: json['authorId']?.toString(),
      authorName: json['authorName']?.toString() ?? 'Tác giả ẩn danh',
      categories: parsedCategories,
    );
  }
}

class CategoryModel {
  final String id;
  final String name;
  final String slug;

  CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
    );
  }
}

class NovelPageResponseModel {
  final List<NovelModel> content;
  final int page;
  final int size;
  final int totalElements;
  final int totalPages;

  NovelPageResponseModel({
    required this.content,
    required this.page,
    required this.size,
    required this.totalElements,
    required this.totalPages,
  });

  factory NovelPageResponseModel.fromJson(Map<String, dynamic> json) {
    final rawList = json['content'] as List? ?? [];
    return NovelPageResponseModel(
      content: rawList.map((e) => NovelModel.fromJson(e as Map<String, dynamic>)).toList(),
      page: (json['page'] as num?)?.toInt() ?? 0,
      size: (json['size'] as num?)?.toInt() ?? 20,
      totalElements: (json['totalElements'] as num?)?.toInt() ?? 0,
      totalPages: (json['totalPages'] as num?)?.toInt() ?? 1,
    );
  }
}
