import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@apollo/react-hooks';
import { GET_USERS, ADD_USER } from "./Queries";
import { Card, CardBody, CardHeader, Spinner, Input, Button } from 'reactstrap';
import {start} from './tracker/index'

function App() {
  const [addUser, {loading}] = useMutation(ADD_USER)
  const getAllUsers = useQuery(GET_USERS);
  const [allUsers, setAllUsers] = useState({})
  

  function createUser(evt) {
    evt.preventDefault()
    let newUser = {
      email: evt.target.email.value,
      name: evt.target.name.value,
      job_title: evt.target.jobtitle.value
    }
    addUser({variables: newUser})
  }

  useEffect(() => {
    getAllUsers.refetch()
    setAllUsers(getAllUsers.data)
  }, [loading, getAllUsers])

  useEffect(() => {
    start()
  }, [] )

  return (
    <div className="container">
      <Card>
        <CardHeader>Add user</CardHeader>
        <CardBody>
          {loading && 
          <>
          <p>
            Submitting....
          </p>
          <Spinner></Spinner>
          </>
          }
          <form onSubmit={createUser}>
            <Input name="name"></Input>
            <Input name="email"></Input>
            <Input name="jobtitle"></Input>
            <Button type='submit'>Save</Button>
          </form>
        </CardBody>
      </Card>
      <Card>
        <CardHeader>Query - Displaying all data</CardHeader>
        <CardBody>
          <pre>
            {JSON.stringify(allUsers, null, 2)}
          </pre>
        </CardBody>
      </Card>
    </div>
  )
}

export default App;
