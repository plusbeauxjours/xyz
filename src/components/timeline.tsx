import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { styled } from "styled-components";
import { db } from "../firebase";
import Tweet from "./tweet";
import { Unsubscribe } from "firebase/auth";

export interface ITweet {
  id: string;
  photo?: string;
  tweet: string;
  userId: string;
  username: string;
  createdAt: number;
}

const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

export default function Timeline() {
  const [tweets, setTweet] = useState<ITweet[]>([]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;
    const fetchTweets = async () => {
      // Order, Limit (limit)
      // 기본적으로 쿼리는 쿼리를 만족하는 모든 document를 document ID별로 오름차순으로 검색합니다.
      // orderBy()를 사용하여 데이터의 정렬 순서를 지정할 수 있으며, limit()를 사용하여 검색되는 document 수를 제한할 수 있습니다.
      // limit()을 지정하는 경우 값은 0보다 크거나 같아야 합니다.
      // https://firebase.google.com/docs/firestore/query-data/order-limit-data#order_and_limit_data
      const tweetsQuery = query(collection(db, "tweets"), orderBy("createdAt", "desc"), limit(25));

      // Collection 의 document를 listen (onSnapshot)
      // document와 마찬가지로 get() 대신 onSnapshot()을 사용하여 query 결과를 listen할 수 있습니다.
      // 그러면 query snapshot이 생성됩니다.
      // snapshot 핸들러는 query 결과가 변경될 때마다(즉, document가 추가, 제거 또는 수정될 때) 새로운 query snapshot을 받습니다.
      // https://firebase.google.com/docs/firestore/query-data/listen#listen_to_multiple_documents_in_a_collection
      unsubscribe = await onSnapshot(tweetsQuery, (snapshot) => {
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
        setTweet(tweets);
      });
    };
    fetchTweets();

    // listener 분리 (unsubscribe)
    // 더 이상 데이터 수신에 관심이 없으면 이벤트 콜백 호출이 중지되도록 listener를 분리해야 합니다.
    // 이를 통해 클라이언트는 업데이트 수신을 위한 대역폭 사용을 중지할 수 있습니다.
    // ex) unsubscribe(); // 변경 사항 listen 중지
    // https://firebase.google.com/docs/firestore/query-data/listen#detach_a_listener
    return () => {
      unsubscribe && unsubscribe();
    };
  }, []);

  return (
    <Wrapper>
      {tweets.map((tweet) => (
        <Tweet key={tweet.id} {...tweet} />
      ))}
    </Wrapper>
  );
}
