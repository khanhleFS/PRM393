class UserModel {
  final String id;
  final String username;
  final String email;
  final String role;
  final int coinBalance;
  final bool isAuthor;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    this.coinBalance = 0,
    this.isAuthor = false,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['userId']?.toString() ?? json['id']?.toString() ?? '',
      username: json['username']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'USER',
      coinBalance: (json['coinBalance'] as num?)?.toInt() ?? 0,
      isAuthor: json['isAuthor'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'userId': id,
        'username': username,
        'email': email,
        'role': role,
        'coinBalance': coinBalance,
        'isAuthor': isAuthor,
      };
}

class LoginResponseModel {
  final String accessToken;
  final String refreshToken;
  final UserModel user;

  LoginResponseModel({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory LoginResponseModel.fromJson(Map<String, dynamic> json) {
    return LoginResponseModel(
      accessToken: json['accessToken']?.toString() ?? '',
      refreshToken: json['refreshToken']?.toString() ?? '',
      user: UserModel.fromJson(json),
    );
  }
}
