type MeetingDate = {
    dateTime: Date;
    timeZone: "UTC";
};

export type Meeting = {
    subject: string;
    responseStatus: {
        response: "accepted" | "rejected";
    };
    organizer: {
        emailAddress: {
            name: string;
            address: string;
        };
    };
    start: MeetingDate;
    end: MeetingDate;
};

export type GraphResponse<T> =
    | {
          value: T;
          error: never;
      }
    | {
          value: never;
          error: {
              code: string;
              message: string;
          };
      };

export type MeetingGraphResponse = GraphResponse<Meeting[]>;
