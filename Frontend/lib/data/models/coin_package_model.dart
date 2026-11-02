class CoinPackageModel {
  final String id;
  final String name;
  final int priceVnd;
  final int baseCoins;
  final bool isActive;

  CoinPackageModel({
    required this.id,
    required this.name,
    required this.priceVnd,
    required this.baseCoins,
    this.isActive = true,
  });

  factory CoinPackageModel.fromJson(Map<String, dynamic> json) {
    return CoinPackageModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Gói Xu',
      priceVnd: (json['priceVnd'] as num?)?.toInt() ?? 0,
      baseCoins: (json['baseCoins'] as num?)?.toInt() ?? 0,
      isActive: json['isActive'] as bool? ?? true,
    );
  }
}

class CoinTransactionModel {
  final String id;
  final String type;
  final int amount;
  final int? balanceAfter;
  final String? note;
  final String createdAt;

  CoinTransactionModel({
    required this.id,
    required this.type,
    required this.amount,
    required this.balanceAfter,
    this.note,
    required this.createdAt,
  });

  factory CoinTransactionModel.fromJson(Map<String, dynamic> json) {
    return CoinTransactionModel(
      id: (json['transactionId'] ?? json['id'])?.toString() ?? '',
      type: (json['transactionType'] ?? json['type'])?.toString() ?? '',
      amount: (json['amount'] as num?)?.toInt() ?? 0,
      balanceAfter: (json['balanceAfter'] as num?)?.toInt(),
      note: (json['note'] ?? json['packageName'])?.toString(),
      createdAt: json['createdAt']?.toString() ?? '',
    );
  }
}
