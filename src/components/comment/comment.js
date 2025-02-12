import { Box, Button, FormControl, Input, InputLabel, Typography } from "@mui/material"
import React, { useState } from 'react';

const CommentSection = ()=>{
  const [comments, setComment] = useState("");
  const [commentList, setCommentList] = useState([]);
    const Submit = ()=>{
        let commentData={
          comment:comments,
        }
        setCommentList((prevState)=>[...prevState,commentData]);
        setComment(" ");
      } 
    return (
        <div>
        <Box sx= {{marginTop: '20px'}}>
        <FormControl fullWidth sx={{ m: 1 }} variant="standard">
        <div>
        <InputLabel htmlFor="text" sx={{color:'white', borderBlockColor:'white'}}>Type your comment here</InputLabel>
        <Input sx={{color:'white', width: '81%', marginTop:'20px'}} onChange={(e)=>setComment(e.target.value)} id="text" type="text" value={comments} />
        <Button onClick = {Submit} sx={{color:'red'}}>Submit</Button>
        </div>
        <Typography variant="h2" sx={{ fontSize: '24px', fontWeight: 'bold', marginTop: '20px' }}>Comments</Typography>
        {
          commentList.map((items)=>{
            return(<div>
              <Typography sx={{ fontSize: '16px', color: '#aaaaaa', marginTop: '10px' }}>{items.comment}</Typography>
            </div>)
          })
        }
        </FormControl>
      </Box>
        </div>
    )
}
export default CommentSection;