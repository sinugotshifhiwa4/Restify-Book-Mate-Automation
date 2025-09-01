import { test, expect } from "../../../fixtures/restifyBookmate.fixture";
import ApiResponseHelper from "../../../src/layers/api/response/apiResponseHelper";
import BookingPayload from "../../../src/layers/api/request/payload/bookingPayload";
import { BookingResponse } from "../../../src/layers/api/response/types/bookingResponse.types";
import logger from "../../../src/utils/logger/loggerManager";

test.describe("Create Booking Test Suite", () => {
  test("Verify booking is created @sanity", async ({ apiClient }) => {
    const response = await apiClient.request("post", "/booking", BookingPayload.createBooking());

    // Assert
    expect(response.status()).toBe(200);

    const responseBody = await ApiResponseHelper.parseJson<BookingResponse>(response);

    // Assert: high-value checks
    expect(responseBody).toHaveProperty("bookingid");
    expect(typeof responseBody.bookingid).toBe("number");
    expect(responseBody.bookingid).toBeGreaterThan(0);

    // Assert booking object
    const booking = responseBody.booking;
    expect(booking.firstname).toBeTruthy();
    expect(typeof booking.firstname).toBe("string");

    expect(booking.lastname).toBeTruthy();
    expect(typeof booking.lastname).toBe("string");

    expect(typeof booking.totalprice).toBe("number");
    expect(booking.totalprice).toBeGreaterThanOrEqual(0);

    expect(typeof booking.depositpaid).toBe("boolean");

    // Validate booking dates
    expect(booking.bookingdates).toBeDefined();
    expect(new Date(booking.bookingdates.checkin).toString()).not.toBe("Invalid Date");
    expect(new Date(booking.bookingdates.checkout).toString()).not.toBe("Invalid Date");

    // Optional field, but should exist
    expect(typeof booking.additionalneeds).toBe("string");

    logger.info(`Verified: Booking created successfully with id=${responseBody.bookingid}`);
  });
});
