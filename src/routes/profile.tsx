import { styled } from "styled-components";
import { auth, db, storage } from "../firebase";
import { useEffect, useState } from "react";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import Tweet from "../components/tweet";
import { ITweet } from "../components/timeline";
import { Error } from "../components/auth-components";

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 20px;
`;
const AvatarUpload = styled.label`
  width: 80px;
  overflow: hidden;
  height: 80px;
  border-radius: 50%;
  background-color: #1d9bf0;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  svg {
    width: 50px;
  }
`;

const AvatarImg = styled.img`
  width: 100%;
`;
const AvatarInput = styled.input`
  display: none;
`;
const Name = styled.span`
  font-size: 22px;
`;
const Tweets = styled.div`
  display: flex;
  width: 100%;
  flex-direction: column;
  gap: 10px;
`;
const EditNameTextField = styled.textarea`
  border: 2px solid white;
  padding: 20px;
  border-radius: 20px;
  font-size: 16px;
  color: white;
  background-color: black;
  width: 100%;
  resize: none;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu,
    Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  &::placeholder {
    font-size: 16px;
  }
  &:focus {
    outline: none;
    border-color: #1d9bf0;
  }
`;
const EditNameButton = styled.button`
  background-color: #1d9bf0;
  color: white;
  font-weight: 600;
  border: 0;
  font-size: 12px;
  padding: 5px 10px;
  text-transform: uppercase;
  border-radius: 5px;
  cursor: pointer;
`;

export default function Profile() {
  const user = auth.currentUser;
  const [avatar, setAvatar] = useState(user?.photoURL);
  const [tweets, setTweets] = useState<ITweet[]>([]);
  const [newName, setNewName] = useState("");
  const [isEdit, setEditing] = useState(false);
  const [errorEditName, setErrorEditName] = useState("");

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!user) return;
    if (files && files.length === 1) {
      const file = files[0];
      const locationRef = ref(storage, `avatars/${user?.uid}`);
      const result = await uploadBytes(locationRef, file);
      const avatarUrl = await getDownloadURL(result.ref);
      setAvatar(avatarUrl);
      await updateProfile(user, {
        photoURL: avatarUrl,
      });
    }
  };
  const fetchTweets = async () => {
    // collection에서 여러 document 가져오기
    // collection의 doucment를 쿼리하여 한 번의 요청으로 여러 document를 검색할 수도 있습니다.
    // 예를 들어, where()를 사용하여 특정 조건을 충족하는 모든 문서를 쿼리한 다음 get()을 사용하여 결과를 검색할 수 있습니다.
    // ex: const q = query(collection(db, "cities"), where("capital", "==", true));
    // https://firebase.google.com/docs/firestore/query-data/get-data#get_multiple_documents_from_a_collection
    const tweetQuery = query(
      collection(db, "tweets"),
      where("userId", "==", user?.uid),
      orderBy("createdAt", "desc"),
      limit(25)
    );
    const snapshot = await getDocs(tweetQuery);
    const tweets = snapshot.docs.map((doc) => {
      const { tweet, createdAt, userId, username, photo } = doc.data();
      return {
        tweet,
        createdAt,
        userId,
        username,
        photo,
        id: doc.id,
      };
    });
    setTweets(tweets);
  };
  const onClickEditName = () => {
    setEditing(true);
  };
  const onClickApplyName = async () => {
    setErrorEditName("");
    if (!user) {
      return;
    }
    if (newName === "") {
      setErrorEditName("Can't change to empty name.");
      return;
    }
    await updateProfile(user, {
      displayName: newName,
    });
    setEditing(false);
  };
  const onChangeEditNameField = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const {
      target: { value },
    } = e;
    setNewName(value);
  };
  useEffect(() => {
    fetchTweets();
  }, []);
  return (
    <Wrapper>
      <AvatarUpload htmlFor="avatar">
        {avatar ? (
          <AvatarImg src={avatar} />
        ) : (
          <svg
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true">
            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
          </svg>
        )}
      </AvatarUpload>
      <AvatarInput onChange={onAvatarChange} id="avatar" type="file" accept="image/*" />
      {isEdit ? (
        <>
          <EditNameTextField onChange={onChangeEditNameField} value={newName} />
          <EditNameButton onClick={onClickApplyName}>Apply</EditNameButton>
          {errorEditName !== "" ? <Error>{errorEditName}</Error> : null}
        </>
      ) : (
        <>
          <Name>{user?.displayName ?? "Anonymous"}</Name>
          <EditNameButton onClick={onClickEditName}>Edit</EditNameButton>
        </>
      )}
      <Tweets>
        {tweets.map((tweet) => (
          <Tweet key={tweet.id} {...tweet} />
        ))}
      </Tweets>
    </Wrapper>
  );
}
