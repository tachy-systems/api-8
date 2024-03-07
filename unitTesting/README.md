# Unit testing notes:

The code you're going to test uses the below token format for all the testcases.

# Sample Token

YTUzODhlYWYzNmNjMjAwYjViYWYyYjNiZWUyOGEzMzdkOTQ3NDUxYWQ1YWY2YjM3MGI0MjM1YTA1MWVlOWRlZTRhZDhjMDBjMWVkZjY0NjRkZjIwNDVlNTZhZWYzM2EyZGFmMDY3M2M1MzcxNDJkMDY1MjU4ZmYzMmNkMzNiYWVmZDg2MjgzOWE4MTUyOTFjMzMyNDM4ZWE2ZDQyYjQwMWM0MWY3YmFiNmViYzJjY2Y5NDVhYTgxZjliZjQ2YmY5MGZhMjBjYzJmMmE2NjI2NDgwZWUxYjg3Y2E3Mzc4OGM1ZTNjZGNiYjNhODM1MmU0OWMyZTRlODI1ZjE3Y2YzNzdhNTVmZmM1NTczM2I5M2M3MTlkN2U4YTU5ODg4MDUwNDU5Njg1YmY2NjM1ZWQ1NGZjYTM4NzRkNTc2MTE2NTA2MGQyYjQ3MTIzMTEzNjIwN2Q1MWNlNjU2YzdiNDlkYThiNzM3MzAwYjMyMDZiMzNiN2I4YmQyNGQ3M2VkMmU0YzBjYTYyOGVmMzEwNmQyOWRhZjFkOGY5NWIxNjFiZTZjN2QzNDlkYWNiMWQ5ZmFiZWJjNjQ3ZmI0NmUyNjMyMQ==

# Sample Token data

{
"domain": "www.talksite.ai",
"subscriptionInfo": "dummy",
"userInfo": {
"domain": "www.talksite.ai",
"userId": {},
"userName": {},
"emailAddress": "dummy",
"phone": "dummy"
},
"noOfAccount": "dummy",
"status": "active"
}

# Note

1. The role is taken as "default"
2. For different test cases, the token is modified and used.
3. Expiration time is set for all the tokens. When you're testing this in future, please create new token by accessing create-customers api in product info repo. This will create tokens in the voais customers db
