import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Post, Put, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from './user.dto';

// Define the shape of a User object
interface User {
  id: string;
  name: string;
  email: string;
}

// Controller for handling "users" related endpoints
@Controller('users')
export class UsersController {
  // In-memory array to simulate a database of users
  private users: User[] = [
    { id: '1', name: 'Alice', email: 'alice@gmail.com' },
    { id: '2', name: 'Bob', email: 'bob@gmail.com' },
    { id: '3', name: 'Charlie', email: 'charlie@gmail.com' },
  ];

  /**
   * GET /users
   * Returns the full list of users
   * Returns the 200 status code by default
   */
  @Get()
  getUsers() {
    return this.users;
  }

  /**
   * GET /users/:id
   * Returns a single user based on the provided ID
   * Example: GET /users/1 → returns user with id = "1"
   * Returns the 200 status code by default
   * If user not found, returns an error message
   */
  @Get(':id')
  findUserById(@Param('id') id: string) {
    const user = this.users.find((user) => user.id === id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    if (user.id === '1') {
      throw new ForbiddenException('Access to this user is forbidden');
    }
    return user;
  }

  /**
   * POST /users
   * Creates a new user and adds it to the in-memory list
   * Request body should match the User interface
   * Returns the 201 status code by default
   * Example:
   * {
   *   "id": "4",
   *   "name": "David",
   *   "email": "david@gmail.com"
   * }
   */
  @Post()
  createUser(@Body() body: CreateUserDto) {
    this.users.push(body);
    // Return the newly added user for confirmation
    return this.users.find((user) => user.id === body.id);
  }

  /**
   * POST /users/create-without-id
   * Creates a new user without requiring an ID in the request body.
   * The system will automatically generate a new ID based on the current
   * number of users.
   */
  @Post('/create-without-id')
  createUserWithoutId(@Body() body: Omit<User, 'id'>) {
    //   // Create a complete User object by merging the new ID with the provided data
    const newUser: User = {
      id: (this.users.length + 1).toString(),
      name: body.name,
      email: body.email,
    };
    // Add the new user to the in-memory list
    this.users.push(newUser);
    // Return the newly created user for confirmation
    return newUser;
  }

  /**
   * Delete /users/:id
   * Deletes a user based on the provided ID
   * Example: DELETE /users/1 → deletes user with id = "1"
   * Returns the 200 status code by default
   * If user not found, returns an error message
   * */
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    // Try to find the user that matches the given ID
    const user = this.users.find((user) => user.id === id);

    // If no user is found, return an error response
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    // Filter out the user with the given ID, effectively "deleting" them
    this.users = this.users.filter((user) => user.id !== id);
    return {
      // Return a confirmation message
      message: 'User deleted successfully',
    };
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() changes: User) {
    const position = this.users.findIndex((user) => user.id === id);
    if (position === -1) {
      return { error_message: 'User not found' };
    }
    const currentData = this.users[position];
    const email = changes?.email;
    /* if (email && !email.includes('@')) {
      throw new UnprocessableEntityException('Email is not valid');
    } */
    const updatedUser = { ...currentData, ...changes };
    this.users[position] = updatedUser;
    return updatedUser;
  }
}
