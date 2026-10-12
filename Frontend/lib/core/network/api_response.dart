class ApiResponse<T> {
  final int code;
  final String message;
  final T? result;

  ApiResponse({
    required this.code,
    required this.message,
    this.result,
  });

  bool get isSuccess => code >= 200 && code < 300;

  factory ApiResponse.fromJson(
    Map<String, dynamic> json, [
    T Function(dynamic)? fromJsonT,
  ]) {
    final rawResult = json['result'];
    T? parsedResult;

    if (rawResult != null) {
      if (fromJsonT != null) {
        parsedResult = fromJsonT(rawResult);
      } else if (rawResult is T) {
        parsedResult = rawResult;
      }
    }

    return ApiResponse<T>(
      code: json['code'] as int? ?? 200,
      message: json['message'] as String? ?? '',
      result: parsedResult,
    );
  }
}
