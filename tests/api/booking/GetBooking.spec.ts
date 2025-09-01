import { test, expect } from "../../../fixtures/restifyBookmate.fixture";
import ApiResponseHelper from "../../../src/layers/api/response/apiResponseHelper";
import BookingPayload from "../../../src/layers/api/request/payload/bookingPayload";
import { Booking } from "../../../src/layers/api/request/types/bookingRequest.type";
import { AllBookingResponse } from "../../../src/layers/api/response/types/bookingResponse.types";
import logger from "../../../src/utils/logger/loggerManager";

test.describe("Get Booking Test Suite", () => {
  test("Verify all bookings are retrieved @sanity", async ({ apiClient }) => {
    const response = await apiClient.request("get", "/booking");

    // Assert
    expect(response.status()).toBe(200);

    const responseBody = await ApiResponseHelper.parseJson<AllBookingResponse>(response);

    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);

    logger.info(`Verified: All booking retrieved successfully`);
  });

  test("Verify booking is retrieved by ID @sanity", async ({ apiClient }) => {
    // Create booking
    const payload = BookingPayload.createBooking();
    const createBookingResponse = await apiClient.request("post", "/booking", payload);

    const createBookingBody = await ApiResponseHelper.parseJson<{ bookingid: number }>(createBookingResponse);
    const bookingId = createBookingBody.bookingid;

    // Get booking
    const response = await apiClient.request("get", `/booking/${bookingId}`);
    expect(response.status()).toBe(200);

    const responseBody = await ApiResponseHelper.parseJson<Booking>(response);
    expect(responseBody).toMatchObject({ ...payload });

    logger.info(`Verified: Booking with ID ${bookingId} retrieved successfully`);
  });
});

// Verify booking is updated successfully @smoke

// Verify booking is deleted @regression

// Verify booking returns validation error for invalid dates @negative
