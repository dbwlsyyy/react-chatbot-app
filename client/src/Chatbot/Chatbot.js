import React, { useEffect } from 'react';
import Axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { saveMessage } from '../_actions/message_actions';
import Message from './Sections/Message';
import { List, Icon, Avatar } from 'antd';
import CardComponent from './Sections/Card';

// export GOOGLE_APPLICATION_CREDENTIALS="chat-app-test-liyu-d79d14d27511.json"

function Chatbot() {
    const dispatch = useDispatch();
    const messagesFromRedux = useSelector((state) => state.message.messages);
    useEffect(() => {
        eventQuery('Welcome');
    }, []);

    const textQuery = async (text) => {
        //let conversations = [];

        let conversation = {
            who: 'user',
            content: {
                text: {
                    text: text,
                },
            },
        };

        dispatch(saveMessage(conversation));
        console.log('text i send : ', conversation);

        const textQueryVariables = {
            text,
        };

        try {
            const response = await Axios.post(
                '/api/dialogflow/textQuery',
                textQueryVariables
            );

            for (let content of response.data.fulfillmentMessages) {
                conversation = {
                    who: 'bot',
                    content: content,
                };
                dispatch(saveMessage(conversation));
            }
        } catch (error) {
            conversation = {
                who: 'bot',
                content: {
                    text: {
                        text: '에러가 발생했습니다. 문제를 확인해주세요',
                    },
                },
            };
            dispatch(saveMessage(conversation));
        }
    };

    const eventQuery = async (event) => {
        const eventQueryVariables = {
            event,
        };

        try {
            const response = await Axios.post(
                '/api/dialogflow/eventQuery',
                eventQueryVariables
            );
            for (let content of response.data.fulfillmentMessages) {
                let conversation = {
                    who: 'bot',
                    content: content,
                };
                dispatch(saveMessage(conversation));
            }
        } catch (error) {
            let conversation = {
                who: 'bot',
                content: {
                    text: {
                        text: '에러가 발생했습니다. 문제를 확인해주세요',
                    },
                },
            };
            dispatch(saveMessage(conversation));
        }
    };

    const keyPressHandler = (e) => {
        if (e.key === 'Enter') {
            if (!e.target.value) {
                return alert('아무 메세지를 보내보세요');
            }

            textQuery(e.target.value);
            e.target.value = '';
        }
    };

    const renderCards = (cards) => {
        return cards.map((card, i) => (
            <CardComponent key={i} cardInfo={card.structValue} />
        ));
    };

    const renderOneMessage = (message, i) => {
        if (
            message.content &&
            message.content.text &&
            message.content.text.text
        ) {
            return (
                <Message
                    key={i}
                    who={message.who}
                    text={message.content.text.text}
                />
            );
        } else if (message.content && message.content.payload.fields.card) {
            const AvatarSrc =
                message.who === 'bot' ? (
                    <Icon type="robot" />
                ) : (
                    <Icon type="smile" />
                );

            return (
                <div>
                    <List.Item style={{ padding: '1rem' }}>
                        <List.Item.Meta
                            avatar={<Avatar icon={AvatarSrc} />}
                            title={message.who}
                            description={renderCards(
                                message.content.payload.fields.card.listValue
                                    .values
                            )}
                        />
                    </List.Item>
                </div>
            );
        }
    };

    const renderMessage = (returnedMessages) => {
        if (returnedMessages) {
            return returnedMessages.map((message, i) => {
                return renderOneMessage(message, i);
            });
        } else {
            return null;
        }
    };

    return (
        <div
            style={{
                height: 700,
                width: 700,
                border: '3px solid black',
                borderRadius: '7px',
            }}
        >
            <div style={{ height: 644, width: '100%', overflow: 'auto' }}>
                {renderMessage(messagesFromRedux)}
            </div>

            <input
                style={{
                    margin: 0,
                    width: '100%',
                    height: 50,
                    borderRadius: '4px',
                    padding: '5px',
                    fontSize: '1rem',
                }}
                onKeyPress={keyPressHandler}
                placeholder="메세지를 입력하세요"
                type="text"
            />
        </div>
    );
}

export default Chatbot;
