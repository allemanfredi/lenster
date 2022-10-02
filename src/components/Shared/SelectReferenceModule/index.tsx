import { useQuery } from '@apollo/client';
import { Input } from '@components/UI/Input';
import { Modal } from '@components/UI/Modal';
import { Tooltip } from '@components/UI/Tooltip';
import { EnabledModulesDocument } from '@generated/documents';
import { Erc20, Profile, ReferenceModules } from '@generated/types';
import {
  ChatAlt2Icon,
  GlobeAltIcon,
  SpeakerphoneIcon,
  TrashIcon,
  UserIcon,
  UsersIcon
} from '@heroicons/react/outline';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { Mixpanel } from '@lib/mixpanel';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { FC, useCallback, useState } from 'react';
import Search from 'src/components/Shared/Navbar/Search';
import UserProfile from 'src/components/Shared/UserProfile';
import { useReferenceModuleStore } from 'src/store/referencemodule';
import { PUBLICATION } from 'src/tracking';

const SelectReferenceModule: FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showPromoteModule, setShowPromoteModal] = useState(false);
  const selectedReferenceModule = useReferenceModuleStore((state) => state.selectedReferenceModule);
  const setSelectedReferenceModule = useReferenceModuleStore((state) => state.setSelectedReferenceModule);
  const onlyFollowers = useReferenceModuleStore((state) => state.onlyFollowers);
  const setOnlyFollowers = useReferenceModuleStore((state) => state.setOnlyFollowers);
  const { commentsRestricted, mirrorsRestricted, degreesOfSeparation } = useReferenceModuleStore();
  const { setCommentsRestricted, setMirrorsRestricted, setDegreesOfSeparation } = useReferenceModuleStore();
  const { influencers, setInfluencers, currencies, setCurrencies, amounts, setAmounts } =
    useReferenceModuleStore();
  const { data } = useQuery(EnabledModulesDocument);

  const ONLY_FOLLOWERS = 'Only followers can comment or mirror';
  const EVERYONE = 'Everyone can comment or mirror';
  const PROMOTE = 'Promote 🔥';
  const RESTRICTED = `Restricted to ${
    commentsRestricted ? 'comments' : 'mirrors'
  } upto ${degreesOfSeparation} degrees`;

  const isFollowerOnlyReferenceModule =
    selectedReferenceModule === ReferenceModules.FollowerOnlyReferenceModule;
  const isDegreesOfSeparationReferenceModule =
    selectedReferenceModule === ReferenceModules.DegreesOfSeparationReferenceModule;

  const onAddInfluencer = useCallback(
    (influencer: Profile) => {
      setInfluencers([...influencers, influencer]);
    },
    [influencers, setInfluencers]
  );

  const onRemoveInfluencer = useCallback(
    (influencer: Profile) => {
      setInfluencers(influencers.filter(({ handle }) => handle !== influencer.handle));
    },
    [influencers, setInfluencers]
  );

  const onSelectCurrency = useCallback(
    (event: any, profile: Profile) => {
      // @ts-ignore
      const value = event.target.value;
      setCurrencies({
        ...currencies,
        [profile.handle]: value
      });
    },
    [currencies, setCurrencies]
  );

  const onChangeAmount = useCallback(
    (event: any, profile: Profile) => {
      const value = event.target.value;
      setAmounts({
        ...amounts,
        [profile.handle]: value
      });
    },
    [amounts, setAmounts]
  );

  return (
    <>
      <Tooltip
        placement="top"
        content={
          selectedReferenceModule === ReferenceModules.PromoteReferenceModule
            ? PROMOTE
            : isDegreesOfSeparationReferenceModule
            ? RESTRICTED
            : onlyFollowers
            ? ONLY_FOLLOWERS
            : EVERYONE
        }
      >
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => {
            setShowModal(!showModal);
            Mixpanel.track(PUBLICATION.NEW.REFERENCE_MODULE.OPEN_COLLECT_CONFIG);
          }}
          aria-label="Choose Reference Module"
        >
          <div className="text-brand">
            {isDegreesOfSeparationReferenceModule ? (
              <UsersIcon className="w-5 h-5" />
            ) : onlyFollowers ? (
              <UserIcon className="w-5 h-5" />
            ) : selectedReferenceModule === ReferenceModules.PromoteReferenceModule ? (
              <SpeakerphoneIcon className="w-5 h-5" />
            ) : (
              <GlobeAltIcon className="w-5 h-5" />
            )}
          </div>
        </motion.button>
      </Tooltip>

      <Modal
        size="md"
        title="Who would you like to promote the post by?"
        icon={<SpeakerphoneIcon className="w-5 h-5 text-brand" />}
        show={showPromoteModule}
        onClose={() => setShowPromoteModal(false)}
      >
        <div>
          <div className="flex p-3 items-center space-x-3">
            <div className="w-full">
              <Search onSelect={onAddInfluencer} />
            </div>
          </div>
          {influencers.map((profile, index) => {
            return (
              <div className="flex p-3 items-center space-x-3" key={profile.handle}>
                <div className="w-full">
                  <UserProfile profile={profile} />
                </div>
                <select
                  className="w-full bg-white rounded-xl border border-gray-300 outline-none dark:bg-gray-800 disabled:bg-gray-500 disabled:bg-opacity-20 disabled:opacity-60 dark:border-gray-700/80 focus:border-brand-500 focus:ring-brand-400"
                  onChange={(e) => onSelectCurrency(e, profile)}
                  value={currencies[profile.handle]}
                >
                  {data?.enabledModuleCurrencies.map((currency: Erc20) => (
                    <option key={currency.address} value={currency.address}>
                      {currency.name}
                    </option>
                  ))}
                </select>
                <Input
                  value={amounts[profile.handle] || ''}
                  onChange={(event) => onChangeAmount(event, profile)}
                />
                <button onClick={() => onRemoveInfluencer(profile)}>
                  <TrashIcon className="w-5 h-5 text-brand" />
                </button>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal
        title="Who can comment or mirror"
        icon={<ChatAlt2Icon className="w-5 h-5 text-brand" />}
        show={showModal}
        onClose={() => setShowModal(false)}
      >
        <div className="py-3.5 px-5 space-y-3">
          <button
            type="button"
            className={clsx(
              { 'border-green-500': selectedReferenceModule === ReferenceModules.PromoteReferenceModule },
              'w-full p-3 border rounded-xl dark:border-gray-700/80 flex justify-between items-center'
            )}
            onClick={() => {
              setSelectedReferenceModule(ReferenceModules.PromoteReferenceModule);
              setOnlyFollowers(false);
              //setShowModal(false);
              setShowPromoteModal(true);
              Mixpanel.track(PUBLICATION.NEW.REFERENCE_MODULE.PROMOTE);
            }}
          >
            <div className="flex items-center space-x-3">
              <SpeakerphoneIcon className="w-5 h-5 text-brand" />
              <div>{PROMOTE}</div>
            </div>
            {selectedReferenceModule === ReferenceModules.PromoteReferenceModule && (
              <CheckCircleIcon className="w-7 text-green-500" />
            )}
          </button>

          <button
            type="button"
            className={clsx(
              { 'border-green-500': isFollowerOnlyReferenceModule && !onlyFollowers },
              'w-full p-3 border rounded-xl dark:border-gray-700/80 flex justify-between items-center'
            )}
            onClick={() => {
              setSelectedReferenceModule(ReferenceModules.FollowerOnlyReferenceModule);
              setOnlyFollowers(false);
              setShowModal(false);
              Mixpanel.track(PUBLICATION.NEW.REFERENCE_MODULE.EVERYONE);
            }}
          >
            <div className="flex items-center space-x-3">
              <GlobeAltIcon className="w-5 h-5 text-brand" />
              <div>{EVERYONE}</div>
            </div>
            {isFollowerOnlyReferenceModule && !onlyFollowers && (
              <CheckCircleIcon className="w-7 text-green-500" />
            )}
          </button>
          <button
            type="button"
            className={clsx(
              { 'border-green-500': isFollowerOnlyReferenceModule && onlyFollowers },
              'w-full p-3 border rounded-xl dark:border-gray-700/80 flex justify-between items-center'
            )}
            onClick={() => {
              setSelectedReferenceModule(ReferenceModules.FollowerOnlyReferenceModule);
              setOnlyFollowers(true);
              setShowModal(false);
              Mixpanel.track(PUBLICATION.NEW.REFERENCE_MODULE.ONLY_FOLLOWERS);
            }}
          >
            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-brand" />
              <div>{ONLY_FOLLOWERS}</div>
            </div>
            {isFollowerOnlyReferenceModule && onlyFollowers && (
              <CheckCircleIcon className="w-7 h-7 text-green-500" />
            )}
          </button>
          <button
            type="button"
            className={clsx(
              { 'border-green-500': isDegreesOfSeparationReferenceModule },
              'w-full p-3 border rounded-xl dark:border-gray-700/80 flex justify-between items-center'
            )}
            onClick={() => {
              setSelectedReferenceModule(ReferenceModules.DegreesOfSeparationReferenceModule);
              setOnlyFollowers(false);
              Mixpanel.track(PUBLICATION.NEW.REFERENCE_MODULE.DEGREES);
            }}
          >
            <div className="flex items-center space-x-3 text-left">
              <UsersIcon className="w-5 h-5 text-brand" />
              <div className="max-w-[90%]">
                Restrict{' '}
                <select
                  className="py-0.5 mx-1 rounded-lg text-sm"
                  onChange={(event) => {
                    // @ts-ignore
                    const value = event.target.value;

                    setCommentsRestricted(value === 'comments');
                    setMirrorsRestricted(value === 'mirrors');
                  }}
                >
                  <option value="comments" selected={commentsRestricted}>
                    comments
                  </option>
                  <option value="mirrors" selected={mirrorsRestricted}>
                    mirrors
                  </option>
                </select>
                to people up to{' '}
                <select
                  className="py-0.5 mx-1 rounded-lg text-sm mt-1"
                  onChange={(event) => {
                    // @ts-ignore
                    const value = event.target.value;
                    setDegreesOfSeparation(parseInt(value));
                  }}
                >
                  <option value={1} selected={degreesOfSeparation === 1}>
                    1 degree
                  </option>
                  <option value={2} selected={degreesOfSeparation === 2}>
                    2 degrees
                  </option>
                  <option value={3} selected={degreesOfSeparation === 3}>
                    3 degrees
                  </option>
                  <option value={4} selected={degreesOfSeparation === 4}>
                    4 degrees
                  </option>
                </select>{' '}
                away from me in my network
              </div>
            </div>
            {isDegreesOfSeparationReferenceModule && <CheckCircleIcon className="w-7 text-green-500" />}
          </button>
        </div>
      </Modal>
    </>
  );
};

export default SelectReferenceModule;
