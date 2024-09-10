from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed

from .serializers import CustomTokenObtainPairSerializer, AccountSerializer, AccountLoginSerializer


UserModel = get_user_model()


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class AccountRegistrationAPIView(APIView):
    """
    Register a new ordinary user.
    """
    serializer_class = AccountSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_201_CREATED)


class AccountLoginAPIView(APIView):
    """
    Login as an ordinary user using email and password.
    """
    serializer_class = AccountLoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        user = serializer.validate(data=request.data)
        
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token)
        }, status=status.HTTP_200_OK)
