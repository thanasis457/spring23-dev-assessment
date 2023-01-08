# Updated README for my implementation
## Introduction

Hi and thanks for looking at my repo! I have tried to keep things simple and pretty self explanatory but keep in mind just a few things:

- I have provided my dotenv file(configured) which I wouldn't normally do but for the sake of simplicity I have provided some credentials that will make the file upload functionality work out of the box. Make sure to change DATABASE_URI (to point to your local mongodb instance) and JWT_STRING(to whatever secret key you want). 
- I have provided a keys.json file with the credentials for an account to my GCP storage account. Again, I would never commit something like this to a public repo but for the sake of simplicity I am providing credentials to a temporary account with access to a free version of GCP Storage so that even if the key is exposed there won't be any actual harm.

So you should just run:
`npm i` and `npm run start`, assuming the `.env` file is pointing to your instance of MongoDB, and everything should running.
## Levels Completed

I completed all Levels and have made minor adjustments/assumptions wherever I felt it made sense.  

## Package versions

Everything was developed and tested using:
- MongoDB v6.0 - used locally (i.e. without Atlas or other cloud solutions)
- NodeJS v16.14.2

If something doesn't work, please try using the versions above.

## Level Completion Log
Small notes on every level completed

### Level 0: Setup
- (0) Implemented
- (1) Implemented

## Level 1: Easy
For all the post requests you do not need to include an _id in the params. It is handled by my code.

- (2) Implemented.
  Does not need to be authenticated (otherwise how would you sign up).  
  Note: No duplicate emails in database. Throws error if user's email already exists in database.  
  Schema of sample query body (urlencoded):
  ```
  {
    firstName: string
    lastName: string
    email: string (in email format)
    password: string
  }
  ```
}
  
- (3) Implemented. Needs JWT Auth.  
  Note: Owner should not be specified. The owner is the account tied to the JWT (because owners should only care about their animals, not other users').  
  Schema of sample body:
  ```
  {
    name: string // animal's name
    hoursTrained: number // total number of hours the animal has been trained for
    dateOfBirth?: Date // animal's date of birth
  }
  ```
  
- (4) Implemented. Needs JWT Auth.  
  Note: Owner should not be specified. The owner is the account tied to the JWT (because owners should only care about their animals, not other users').  
  I also check if the current user is indeed the owner of the animal (as specified in another requirement).  
  Schema of sample body:  
  ```
  {
    date: Date // date of training log
    description: string // description of training log
    hours: number // number of hours the training log records
    animal: ObjectId // animal this training log corresponds to
  }
  ```

All reponses give the status codes requested in the original README.

## Level 2: Medium

- (5) Implemented.  
  Owner is assumed to be current user (using the JWT)

- (6), (7), (8): Implemented. Needs JWT Auth.

Pagination using _id (like in method 2) implemented. By default first 20 results show.  
You can navigate through the results using GET request parameters. Schema:
```
{
  limit?: number //Number of results that should be returned
  lastIndex?: string (MongoId) //index of the last element returned from previous request (index of element to jump to).
}
```
So using `limit` and `lastIndex` you can optionally navigate through the results. `limit` is capped at 100.

## Level 3: Hard

- (9) Implemented
- (10) Implemented
- (11) Implemented
- (12) Implemented. Need verification for:
  - `/api/animal`
  - `/api/training`
  - `/api/admin/users`
  - `/api/admin/animals`
  - `/api/admin/training`
  - `/api/file/upload`
  
  For the other endpoints it does not make sense to request verification.
  - `/` : obvious why
  - `/healthy` : obvious why
  - `api/user` : sign up endpoint
  - `api/user/login` : obvious why
  - `api/user/verify` : obvious why
- (13) Implemented  
  As stated above, whenever an owner is needed, it is inferred from the JWT.

## Level 4: Expert

- (14) Implemented  
Using Google Cloud Storage and sent with multipart/form-data.

A sample form-data request would like like this:
```
{
  file: image or video //Image or Video to upload
  type: 'UserProfile' | 'AnimalProfile' | 'TrainingVideo' //String specifiying what type of data we are uploading.
  id: string (MongoId) //ID of the user/animal/training log this file belongs to
}
```
As stated in the beginning, I have uploaded tokens with access to a temporary google account for easy setup for you. In a normal setting I would never upload such information to GitHub and would probably reside in a dotenv file.

Please contact me if something does not work. I have implemented everything so if something does not work on your end I would like to fix it.