# login-Auth-API
using jwt for next login request to server

#setup packages and enviroment

#### 1. open terminal download node packages by 
```bash
npm install
```

#### 2. build and run docker containers by
```bash
docker-compose -d --build
```

#### 3 test register and login API 




there are 3 api endpoints 

1./api/register (using for register a new email & password into database)

2./api/login (using for login and saving jwt in cookies for next request to the server)

3./api/users (once request to the login api successfully try to request to users endpoints to get all response data of users from database without identify email & password)

### thanks for reading bye bye :D

![shiroko thumbs up to you](https://i.pinimg.com/736x/2b/e5/5d/2be55d4152851b28d31b29c8725c2d90.jpg)
