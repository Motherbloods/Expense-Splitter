const {
  create_expense_form,
  create_expense,
  edit_expense_form,
  update_expense,
  delete_expense,
} = require("../controller/expense.controller");
const Room = require("../models/Room");
const Expense = require("../models/Expense");

// Mock the required models
jest.mock("../models/Room");
jest.mock("../models/Expense");

describe("Expense Controller", () => {
  let mockRequest;
  let mockResponse;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      render: jest.fn(),
      redirect: jest.fn(),
    };
  });

  describe("create_expense_form", () => {
    it("should render the create form with room data", async () => {
      const mockRoom = { _id: "room123", name: "Test Room" };
      Room.findById.mockResolvedValue(mockRoom);
      mockRequest.params.roomId = "room123";

      await create_expense_form(mockRequest, mockResponse);

      expect(Room.findById).toHaveBeenCalledWith("room123");
      expect(mockResponse.render).toHaveBeenCalledWith("create", {
        roomId: "room123",
        room: mockRoom,
      });
    });

    it("should return 404 if room is not found", async () => {
      Room.findById.mockResolvedValue(null);
      mockRequest.params.roomId = "nonexistent";

      await create_expense_form(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.send).toHaveBeenCalledWith("Room not found");
    });
  });

  describe("create_expense", () => {
    it("should create a new expense and redirect", async () => {
      const mockExpense = {
        save: jest.fn(),
        calculateSplits: jest.fn(),
      };
      Expense.mockImplementation(() => mockExpense);
      mockRequest.params.roomId = "room123";
      mockRequest.body = {
        description: "Test Expense",
        total: 100,
        participants: "Alice, Bob",
      };

      await create_expense(mockRequest, mockResponse);

      expect(Expense).toHaveBeenCalledWith({
        ...mockRequest.body,
        room: "room123",
        participants: ["alice", "bob"],
      });
      expect(mockExpense.calculateSplits).toHaveBeenCalled();
      expect(mockExpense.save).toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith("/dashboard/room123");
    });
  });

  // Add these tests to the existing expense.controller.test.js file

  describe("edit_expense_form", () => {
    it("should render the edit form with expense data", async () => {
      const mockExpense = {
        _id: "expense123",
        description: "Test Expense",
        total: 100,
        participants: ["alice", "bob"],
        room: {
          _id: "room123",
          name: "Test Room",
        },
      };
      Expense.findById.mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockExpense),
      });
      mockRequest.params.roomId = "room123";
      mockRequest.params.expenseId = "expense123";

      await edit_expense_form(mockRequest, mockResponse);

      expect(Expense.findById).toHaveBeenCalledWith("expense123");
      expect(mockResponse.render).toHaveBeenCalledWith("edit", {
        expense: mockExpense,
        roomId: "room123",
      });
    });

    it("should handle errors when fetching expense", async () => {
      const mockError = new Error("Database error");
      Expense.findById.mockReturnValue({
        populate: jest.fn().mockRejectedValue(mockError),
      });
      mockRequest.params.roomId = "room123";
      mockRequest.params.expenseId = "expense123";

      console.error = jest.fn(); // Mock console.error

      await edit_expense_form(mockRequest, mockResponse);

      expect(console.error).toHaveBeenCalledWith(mockError);
    });
  });

  describe("update_expense", () => {
    it("should update an existing expense and redirect", async () => {
      const mockExpense = {
        _id: "expense123",
        room: "room123",
        save: jest.fn(),
        calculateSplits: jest.fn(),
      };
      Expense.findById.mockResolvedValue(mockExpense);
      mockRequest.params.expenseId = "expense123";
      mockRequest.body = {
        description: "Updated Expense",
        total: 150,
        participants: "Alice, Bob, Charlie",
      };

      await update_expense(mockRequest, mockResponse);

      expect(Expense.findById).toHaveBeenCalledWith("expense123");
      expect(mockExpense.calculateSplits).toHaveBeenCalled();
      expect(mockExpense.save).toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith("/dashboard/room123");
      expect(mockExpense).toMatchObject({
        description: "Updated Expense",
        total: 150,
        participants: ["alice", "bob", "charlie"],
      });
    });

    it("should handle errors when updating expense", async () => {
      const mockError = new Error("Update error");
      Expense.findById.mockRejectedValue(mockError);
      mockRequest.params.expenseId = "expense123";

      console.error = jest.fn(); // Mock console.error

      await update_expense(mockRequest, mockResponse);

      expect(console.error).toHaveBeenCalledWith(mockError);
    });
  });

  describe("delete_expense", () => {
    it("should delete an expense and redirect", async () => {
      const mockExpense = {
        _id: "expense123",
        room: "room123",
      };
      Expense.findByIdAndDelete.mockResolvedValue(mockExpense);
      mockRequest.params.expenseId = "expense123";

      await delete_expense(mockRequest, mockResponse);

      expect(Expense.findByIdAndDelete).toHaveBeenCalledWith("expense123");
      expect(mockResponse.redirect).toHaveBeenCalledWith("/dashboard/room123");
    });

    it("should handle errors when deleting expense", async () => {
      const mockError = new Error("Delete error");
      Expense.findByIdAndDelete.mockRejectedValue(mockError);
      mockRequest.params.expenseId = "expense123";

      await delete_expense(mockRequest, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.send).toHaveBeenCalledWith("Error deleting expense");
    });
  });
});
