const {
  list_rooms,
  create_room_form,
  create_room,
  dashboard,
} = require("../controller/rooms.controller");
const Room = require("../models/Room");
const Expense = require("../models/Expense");

jest.mock("../models/Room");
jest.mock("../models/Expense");

describe("Rooms Controller", () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  describe("list_rooms", () => {
    it("should render list of rooms", async () => {
      const mockRooms = [{ name: "Room 1" }, { name: "Room 2" }];
      Room.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockRooms),
      });

      await list_rooms(mockRequest, mockResponse);

      expect(Room.find).toHaveBeenCalled();
      expect(mockResponse.render).toHaveBeenCalledWith("list_room", {
        rooms: mockRooms,
      });
    });
  });

  describe("create_room_form", () => {
    it("should render create room form", () => {
      create_room_form(mockRequest, mockResponse);

      expect(mockResponse.render).toHaveBeenCalledWith("create_room");
    });
  });

  describe("create_room", () => {
    it("should create a new room and redirect", async () => {
      const mockRoom = {
        save: jest.fn(),
      };
      Room.mockImplementation(() => mockRoom);
      mockRequest.body = { name: "New Room" };

      await create_room(mockRequest, mockResponse);

      expect(Room).toHaveBeenCalledWith(mockRequest.body);
      expect(mockRoom.save).toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith("/");
    });
  });

  describe("dashboard", () => {
    it("should render dashboard with room and expense data", async () => {
      const mockRoom = { _id: "room123", name: "Test Room" };
      const mockExpenses = [
        {
          _id: "exp1",
          total: 100,
          participants: ["alice", "bob"],
          paidBy: "alice",
        },
        {
          _id: "exp2",
          total: 200,
          participants: ["bob", "charlie"],
          paidBy: "bob",
        },
      ];

      Room.findById.mockResolvedValue(mockRoom);
      Expense.find.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExpenses),
      });

      mockRequest.params.roomID = "room123";

      await dashboard(mockRequest, mockResponse);

      expect(Room.findById).toHaveBeenCalledWith("room123");
      expect(Expense.find).toHaveBeenCalledWith({ room: "room123" });
      expect(mockResponse.render).toHaveBeenCalledWith(
        "dashboard",
        expect.objectContaining({
          room: mockRoom,
          expenses: mockExpenses,
          detailedSplits: expect.any(Object),
          finalSplits: expect.any(Object),
        })
      );
    });

    it("should redirect if room is not found", async () => {
      Room.findById.mockResolvedValue(null);
      mockRequest.params.roomID = "nonexistent";

      await dashboard(mockRequest, mockResponse);

      expect(mockResponse.redirect).toHaveBeenCalledWith("/");
    });
  });
});
