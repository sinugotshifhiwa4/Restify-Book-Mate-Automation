import { test, expect } from "../../../fixtures/restifyBookmate.fixture";
import ApiResponseHelper from "../../../src/layers/api/response/apiResponseHelper";
import BookingPayload from "../../../src/layers/api/request/payload/bookingPayload";
import logger from "../../../src/utils/logger/loggerManager";

test.describe("Delete Booking Test Suite", () => {
  test("Verify booking is deleted by ID @sanity", async ({ apiClient, environmentResolver }) => {
    // Generate token
    const authPayload = await environmentResolver.getApiCredentials();
    const tokenResponse = await apiClient.request("post", "/auth", authPayload);
    const tokenResponseBody = await ApiResponseHelper.parseJson<{ token: string }>(tokenResponse);
    const token = tokenResponseBody.token;

    // Create booking
    const payload = BookingPayload.createBooking();
    const createBookingResponse = await apiClient.request("post", "/booking", payload);

    const createBookingBody = await ApiResponseHelper.parseJson<{ bookingid: number }>(createBookingResponse);
    const bookingId = createBookingBody.bookingid;

    // Delete booking
    const response = await apiClient.request("delete", `/booking/${bookingId}`, undefined, {
      authOptions: {
        cookies: { token: token },
      },
    });

    expect(response.status()).toBe(201);

    logger.info(`Verified: Booking with ID ${bookingId} deleted successfully`);
  });
});
