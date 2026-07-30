from django.urls import path
from .views import StripeWebhookView

urlpatterns = [
    # Stripe webhook — no JWT auth, signature-verified by Stripe
    path("payments/webhook/", StripeWebhookView.as_view(), name="stripe-webhook"),
]
