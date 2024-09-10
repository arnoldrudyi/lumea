from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model


UserModel = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = UserModel.USERNAME_FIELD


class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['email', 'username', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def validate_email(self, value):
        if UserModel.objects.filter(email=value).exists():
            raise serializers.ValidationError('Account with such Email is already exists.')
        return value
    
    def validate_username(self, value):
        if UserModel.objects.filter(username=value).exists():
            raise serializers.ValidationError('Account with such Username is already exists.')
        return value

    def validate_password(self, value):
        validate_password(value)
        return value
    
    def save(self, **kwargs):
        account = UserModel.objects.create_user(**self.validated_data)
        account.save()

        return account


class AccountLoginSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserModel
        fields = ['email', 'password']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        errors = {}

        if not email:
            errors['email'] = ['This field cannot be empty.']

        if not password:
            errors['password'] = ['This field cannot be empty.']

        if errors:
            raise serializers.ValidationError(errors)

        user = UserModel.objects.filter(email=email).first()

        if user is None:
            raise serializers.ValidationError({'email': ['No user found with such email.']})

        if not user.check_password(password):
            raise serializers.ValidationError({'password': ['Incorrect password.']})

        return user
