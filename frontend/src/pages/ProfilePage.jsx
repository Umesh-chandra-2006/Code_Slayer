import React,{useEffect, useState} from 'react';
import axios from 'axios';

const ProfilePage = () => {
    const [user,setuser] = useState(null);
    const [loading, setloading] = useState(true);
    const [error, seterror] = useState('');

    useEffect(() => {
        const fetchprofile = async() => {
            try {
                const token = localStorage.getItem('token');
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const {data} =await axios.get('/api/user/profile',config);
                console.log('Profile data:', data);
                setuser(data);
                setloading(false);
            } catch(err) {
                seterror('Failed to load user profile');
                setloading(false);
            }
        };

        fetchprofile();
    },[]);

    if(loading) return <div> Loading..</div>;
    if(error) return <div>{error}</div>;

    return (
        <div>
            <h1>User Profile</h1>
            <p><strong>Name:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
        </div>
    );
};

export default ProfilePage;