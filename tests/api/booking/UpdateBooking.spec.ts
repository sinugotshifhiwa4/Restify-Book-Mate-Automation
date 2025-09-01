import { test, expect } from "../../../fixtures/restifyBookmate.fixture";
import ApiResponseHelper from "../../../src/layers/api/response/apiResponseHelper";
import BookingPayload from "../../../src/layers/api/request/payload/bookingPayload";
import { Booking } from "../../../src/layers/api/request/types/bookingRequest.type";
import BookingUtils from "../../../src/layers/api/request/bookingUtils";
import logger from "../../../src/utils/logger/loggerManager";

test.describe("Update Booking Test Suite", () => {
  test(" Verify booking is updated by ID @sanity", async ({ apiClient, environmentResolver }) => {
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

    // Build update payload
    const updatePayload: Booking = {
      ...payload,
      firstname: "Tshifhiwa",
      totalprice: payload.totalprice + 3000,
      depositpaid: true,
      bookingdates: {
        checkin: BookingUtils.getDateFromCurrent(10),
        checkout: BookingUtils.getDateFromCurrent(22),
      },
      additionalneeds: BookingUtils.generateRandomAdditionalNeed(undefined, 2),
    };

    // Update booking
    const response = await apiClient.request("put", `/booking/${bookingId}`, updatePayload, {
      authOptions: {
        cookies: { token: token },
      },
    });

    expect(response.status()).toBe(200);

    const responseBody = await ApiResponseHelper.parseJson<Booking>(response);
    expect(responseBody).toMatchObject({ ...updatePayload });

    logger.info(`Verified: Booking with ID ${bookingId} updated successfully`);
  });

  test(" Verify booking is partially updated by ID @sanity", async ({ apiClient, environmentResolver }) => {
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

    // Build update payload
    const updatePayload: Booking = {
      ...payload,
      firstname: "Raymond",
      lastname: "Reddington",
    };

    // Update booking
    const response = await apiClient.request("put", `/booking/${bookingId}`, updatePayload, {
      authOptions: {
        cookies: { token: token },
      },
    });

    expect(response.status()).toBe(200);

    const responseBody = await ApiResponseHelper.parseJson<Booking>(response);
    expect(responseBody).toMatchObject({ ...updatePayload });
    logger.info(`Partially Updated Booking Response: ${JSON.stringify(responseBody)}`);

    logger.info(`Verified: Booking with ID ${bookingId} partially updated successfully`);
  });
});
