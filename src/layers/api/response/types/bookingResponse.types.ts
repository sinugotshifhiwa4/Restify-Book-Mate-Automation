import { Booking } from "../../request/types/bookingRequest.type";

export interface AuthSuccessResponse {
  token: string;
}

export interface AuthFailureResponse {
  reason: string;
}

export interface BookingResponse {
  bookingid: number;
  booking: Booking;
}
