from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class OrganizerRequestAPITests(APITestCase):
    def setUp(self):
        # Create users with different roles and statuses
        self.student_not_applied = User.objects.create_user(
            email="student1@test.com",
            password="Password123!",
            first_name="Student",
            last_name="One",
            role=User.Role.STUDENT,
            organizer_status=User.OrganizerStatus.NOT_APPLIED,
            is_active=True,
            is_email_verified=True,
        )
        self.student_rejected = User.objects.create_user(
            email="student2@test.com",
            password="Password123!",
            first_name="Student",
            last_name="Two",
            role=User.Role.STUDENT,
            organizer_status=User.OrganizerStatus.REJECTED,
            is_active=True,
            is_email_verified=True,
        )
        self.student_pending = User.objects.create_user(
            email="student3@test.com",
            password="Password123!",
            first_name="Student",
            last_name="Three",
            role=User.Role.STUDENT,
            organizer_status=User.OrganizerStatus.PENDING,
            is_active=True,
            is_email_verified=True,
        )
        self.student_approved = User.objects.create_user(
            email="student4@test.com",
            password="Password123!",
            first_name="Student",
            last_name="Four",
            role=User.Role.STUDENT,
            organizer_status=User.OrganizerStatus.APPROVED,
            is_active=True,
            is_email_verified=True,
        )
        self.organizer_user = User.objects.create_user(
            email="organizer@test.com",
            password="Password123!",
            first_name="Organizer",
            last_name="One",
            role=User.Role.ORGANIZER,
            is_active=True,
            is_email_verified=True,
        )

        self.apply_url = reverse("organizer_apply")
        self.status_url = reverse("organizer_status")

    def get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_apply_unauthenticated(self):
        response = self.client.post(self.apply_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_apply_non_student(self):
        token = self.get_token(self.organizer_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.post(self.apply_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_apply_student_not_applied(self):
        token = self.get_token(self.student_not_applied)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.post(self.apply_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.student_not_applied.refresh_from_db()
        self.assertEqual(self.student_not_applied.organizer_status, User.OrganizerStatus.PENDING)
        self.assertEqual(response.data["success"], True)
        self.assertEqual(response.data["data"]["organizer_status"], "PENDING")

    def test_apply_student_rejected(self):
        token = self.get_token(self.student_rejected)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.post(self.apply_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.student_rejected.refresh_from_db()
        self.assertEqual(self.student_rejected.organizer_status, User.OrganizerStatus.PENDING)

    def test_apply_student_already_pending(self):
        token = self.get_token(self.student_pending)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.post(self.apply_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_apply_student_already_approved(self):
        token = self.get_token(self.student_approved)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.post(self.apply_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_status_unauthenticated(self):
        response = self.client.get(self.status_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_status_authenticated(self):
        token = self.get_token(self.student_pending)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get(self.status_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        self.assertEqual(response.data["success"], True)
        self.assertEqual(response.data["organizer_status"], "PENDING")
        self.assertEqual(response.data["role"], "STUDENT")
        self.assertIn("message", response.data)


class AdminOrganizerApprovalAPITests(APITestCase):
    def setUp(self):
        # Create an admin user
        self.admin_user = User.objects.create_user(
            email="admin@test.com",
            password="Password123!",
            first_name="Admin",
            last_name="User",
            role=User.Role.ADMIN,
            is_active=True,
            is_staff=True,
            is_email_verified=True,
        )
        # Create non-admin users
        self.student_user = User.objects.create_user(
            email="student@test.com",
            password="Password123!",
            first_name="Student",
            last_name="User",
            role=User.Role.STUDENT,
            organizer_status=User.OrganizerStatus.NOT_APPLIED,
            is_active=True,
            is_email_verified=True,
        )
        self.student_pending = User.objects.create_user(
            email="pending@test.com",
            password="Password123!",
            first_name="Pending",
            last_name="Student",
            role=User.Role.STUDENT,
            organizer_status=User.OrganizerStatus.PENDING,
            is_active=True,
            is_email_verified=True,
        )
        self.student_approved = User.objects.create_user(
            email="approved@test.com",
            password="Password123!",
            first_name="Approved",
            last_name="Student",
            role=User.Role.ORGANIZER,
            organizer_status=User.OrganizerStatus.APPROVED,
            is_active=True,
            is_email_verified=True,
        )

        self.list_url = reverse("admin_organizer_requests_list")

    def get_token(self, user):
        refresh = RefreshToken.for_user(user)
        return str(refresh.access_token)

    def test_list_requests_unauthenticated(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_requests_non_admin(self):
        token = self.get_token(self.student_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_list_requests_admin_default_pending(self):
        token = self.get_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["success"])
        # Should only return pending
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["email"], "pending@test.com")

    def test_list_requests_admin_filter_approved(self):
        token = self.get_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get(self.list_url, {"status": "APPROVED"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["data"]), 1)
        self.assertEqual(response.data["data"][0]["email"], "approved@test.com")

    def test_list_requests_admin_filter_all(self):
        token = self.get_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.get(self.list_url, {"status": "all"})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should return both pending and approved
        self.assertEqual(len(response.data["data"]), 2)

    def test_approve_request_success(self):
        url = reverse("admin_organizer_approve", kwargs={"user_id": self.student_pending.id})
        token = self.get_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.patch(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student_pending.refresh_from_db()
        self.assertEqual(self.student_pending.organizer_status, User.OrganizerStatus.APPROVED)
        self.assertEqual(self.student_pending.role, User.Role.ORGANIZER)

    def test_approve_request_non_admin_forbidden(self):
        url = reverse("admin_organizer_approve", kwargs={"user_id": self.student_pending.id})
        token = self.get_token(self.student_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_approve_request_not_pending_bad_request(self):
        url = reverse("admin_organizer_approve", kwargs={"user_id": self.student_approved.id})
        token = self.get_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_approve_request_not_found(self):
        import uuid
        url = reverse("admin_organizer_approve", kwargs={"user_id": uuid.uuid4()})
        token = self.get_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_reject_request_success(self):
        url = reverse("admin_organizer_reject", kwargs={"user_id": self.student_pending.id})
        token = self.get_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.patch(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student_pending.refresh_from_db()
        self.assertEqual(self.student_pending.organizer_status, User.OrganizerStatus.REJECTED)
        self.assertEqual(self.student_pending.role, User.Role.STUDENT)

    def test_reject_request_not_pending_bad_request(self):
        url = reverse("admin_organizer_reject", kwargs={"user_id": self.student_approved.id})
        token = self.get_token(self.admin_user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        response = self.client.patch(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

