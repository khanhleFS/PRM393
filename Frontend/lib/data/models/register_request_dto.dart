class RegisterRequestDTO {
  final String fullName;
  final String email;
  final String password;
  final String confirmPassword;
  final String phone;
  final String? address;
  final bool? isActive;

  const RegisterRequestDTO({
    required this.fullName,
    required this.email,
    required this.password,
    required this.confirmPassword,
    required this.phone,
    this.address,
    this.isActive = false,
  });

  Map<String, dynamic> toJson() => {
        'fullName': fullName.trim(),
        'username': fullName.trim(),
        'email': email.trim(),
        'password': password,
        'confirmPassword': confirmPassword,
        'phone': phone.trim(),
        if (address != null && address!.trim().isNotEmpty) 'address': address!.trim(),
        if (isActive != null) 'isActive': isActive,
      };

  factory RegisterRequestDTO.fromJson(Map<String, dynamic> json) {
    return RegisterRequestDTO(
      fullName: json['fullName'] as String? ?? json['username'] as String? ?? '',
      email: json['email'] as String? ?? '',
      password: json['password'] as String? ?? '',
      confirmPassword: json['confirmPassword'] as String? ?? '',
      phone: json['phone'] as String? ?? '',
      address: json['address'] as String?,
      isActive: json['isActive'] as bool? ?? false,
    );
  }
}
