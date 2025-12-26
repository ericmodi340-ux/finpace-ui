import { useEffect, useState } from 'react';
import { PubSub } from 'aws-amplify';
// config
import { stage } from 'config';
// redux
import { useSelector, useDispatch, AppDispatch } from 'redux/store';
import { createNotificationSuccess } from 'redux/slices/notifications';
import {
  createEnvelopeSuccess,
  updateEnvelopeSuccess,
  updateEnvelopeStatus,
  updateEnvelopeSignerStatus,
} from 'redux/slices/envelopes';
// hooks
import useAuth from 'hooks/useAuth';
// constants
import { envelopeStatuses, envelopeRecipientStatuses } from 'constants/envelopes';
import { roles } from 'constants/users';

// ----------------------------------------------------------------------

const getTopicName = (value: { [key in symbol]: string }, subscribedTopics: string[]) => {
  // Remove wildcards to find subBases
  const subBases = subscribedTopics.map((wildcardTopic) =>
    wildcardTopic.replace(/\/#/g, '/').replace(/\/\+/g, '/')
  );
  const fullTopic = value[Object.getOwnPropertySymbols(value)[0]];

  let topicName = fullTopic;
  subBases.forEach((subBase) => {
    topicName = topicName.replace(subBase, '');
  });

  return topicName;
};

// ----------------------------------------------------------------------

const handlePubSubMessage = (
  topic: string,
  value: { [key: string]: any },
  dispatch: AppDispatch
) => {
  console.log(`Received message for topic '${topic}':`, value);

  switch (topic) {
    case 'ENVELOPE_CREATED':
      dispatch(createEnvelopeSuccess(value.envelope));
      break;
    case 'SIGNER_SIGNED':
      dispatch(
        updateEnvelopeSignerStatus({
          envelopeId: value.envelopeId,
          roleName: value.roleName,
          status: envelopeRecipientStatuses.SIGNED,
        })
      );
      break;
    case 'ENVELOPE_COMPLETED':
      dispatch(
        updateEnvelopeStatus({
          envelopeId: value.envelopeId,
          status: envelopeStatuses.COMPLETED,
        })
      );
      break;
    case 'ENVELOPE_UPDATED':
      dispatch(updateEnvelopeSuccess(value.envelope));
      break;
    case 'ENVELOPE_DELETED':
      // TODO: [DEV-610] PubSub for ENVELOPE_DELETED
      // dispatch(deleteEnvelopeSuccess(value.id));
      break;
    case 'NOTIFICATION_CREATED':
      dispatch(createNotificationSuccess(value));
      break;
  }
};

// ----------------------------------------------------------------------

const usePubSub = () => {
  const { user } = useAuth();
  const { subId } = useSelector((state) => state.pubsub);
  const dispatch = useDispatch();
  const [subError, setSubError] = useState(false);

  // Refresh on subscription errors
  useEffect(() => {
    if (subError) {
      console.log('Refreshing page after PubSub error...');
      // TODO: [DEV-534] Prompt user to finish changes and refresh page
      window.location.reload();
    }
  }, [subError]);

  useEffect(() => {
    if (!subId || !user) {
      return;
    }

    const { firmId, role } = user;

    const topics = [`${stage}/${subId}/#`];

    if (role === roles.FIRM_ADMIN) {
      topics.push(`${stage}/${firmId}/+`);
    } else if (role === roles.ADVISOR) {
      topics.push(`${stage}/${firmId}/advisors/+`);
    }

    console.log(`Subscribing to ${topics}...`);

    const sub = PubSub.subscribe(topics).subscribe({
      next: ({ value }) => {
        const topic = getTopicName(value as any, topics);
        handlePubSubMessage(topic, value as any, dispatch);
      },
      // TODO: [DEV-147] handle network errors and reconnect
      error: (error) => {
        console.error(error);

        if (error.error?.errorCode === 8) {
          // Socket closed error, prompt user to refresh
          setSubError(true);
        }
      },
      complete: () => console.log('Done'),
    });

    return () => {
      console.log('Unsubscribing from pub sub...');
      sub.unsubscribe();
    };
  }, [subId, user, dispatch]);
};

export default usePubSub;
