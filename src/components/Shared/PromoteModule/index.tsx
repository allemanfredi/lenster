import { useQuery } from '@apollo/client';
import { Button } from '@components/UI/Button';
import { Input } from '@components/UI/Input';
import { Modal } from '@components/UI/Modal';
import { Tooltip } from '@components/UI/Tooltip';
import type { Erc20, Profile } from '@generated/types';
import { EnabledModulesDocument } from '@generated/types';
import { ReferenceModules } from '@generated/types';
import { SpeakerphoneIcon, TrashIcon } from '@heroicons/react/outline';
import { Mixpanel } from '@lib/mixpanel';
import { motion } from 'framer-motion';
import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Search from 'src/components/Shared/Navbar/Search';
import UserProfile from 'src/components/Shared/UserProfile';
import { useReferenceModuleStore } from 'src/store/referencemodule';
import { PUBLICATION } from 'src/tracking';

const PromoteModule: FC = () => {
  const [showModal, setShowModal] = useState(false);
  const { data } = useQuery(EnabledModulesDocument);
  const {
    lensFluencers,
    setLensFluencers,
    currencies,
    setCurrencies,
    amounts,
    setAmounts,
    selectedReferenceModule,
    setSelectedReferenceModule
  } = useReferenceModuleStore();
  const [localLensFluencers, setLocalLensFluencers] = useState(lensFluencers);
  const [localCurrencies, setLocalCurrencies] = useState(currencies);
  const [localAmounts, setLocalAmounts] = useState(amounts);
  const [enableSave, setEnableSave] = useState(false);

  const toEnable = useMemo(
    () =>
      selectedReferenceModule !== ReferenceModules.PromoteModule &&
      Object.keys(currencies).length > 0 &&
      lensFluencers.length > 0 &&
      Object.keys(amounts).length > 0,
    [selectedReferenceModule, currencies, lensFluencers, amounts]
  );

  const onAddInfluencer = useCallback(
    (lensFluencer: Profile) => {
      setLocalLensFluencers([...localLensFluencers, lensFluencer]);
      setLocalAmounts({
        ...localAmounts,
        [lensFluencer.handle]: '0'
      });
      setLocalCurrencies({
        ...localCurrencies,
        [lensFluencer.handle]: data?.enabledModuleCurrencies[0].address
      });
      setEnableSave(true);
    },
    [localLensFluencers, localAmounts, localCurrencies, data?.enabledModuleCurrencies]
  );

  const onRemoveInfluencer = useCallback(
    (lensFluencer: Profile) => {
      setLocalLensFluencers(localLensFluencers.filter(({ handle }) => handle !== lensFluencer.handle));
      setLocalAmounts(
        Object.keys(localAmounts).reduce((acc, handle) => {
          if (handle === lensFluencer.handle) {
            return acc;
          }
          // @ts-ignore
          acc[handle] = localAmounts[handle];
          return acc;
        }, {})
      );
      setLocalCurrencies(
        Object.keys(localCurrencies).reduce((acc, handle) => {
          if (handle === lensFluencer.handle) {
            return acc;
          }
          // @ts-ignore
          acc[handle] = localCurrencies[handle];
          return acc;
        }, {})
      );
      setEnableSave(true);
    },
    [localLensFluencers, setLocalLensFluencers]
  );

  const onSelectCurrency = useCallback(
    (event: any, profile: Profile) => {
      // @ts-ignore
      const value = event.target.value;
      setLocalCurrencies({
        ...localCurrencies,
        [profile.handle]: value
      });
      setEnableSave(true);
    },
    [localCurrencies, setLocalCurrencies]
  );

  const onChangeAmount = useCallback(
    (event: any, profile: Profile) => {
      const value = event.target.value;
      setLocalAmounts({
        ...localAmounts,
        [profile.handle]: value
      });
      setEnableSave(true);
    },
    [localAmounts, setLocalAmounts]
  );

  const onSave = useCallback(() => {
    if (toEnable) {
      setSelectedReferenceModule(ReferenceModules.PromoteModule);
      return;
    }

    setLensFluencers(localLensFluencers);
    setCurrencies(localCurrencies);
    setAmounts(localAmounts);
    setShowModal(false);
    setEnableSave(false);
    setSelectedReferenceModule(ReferenceModules.PromoteModule);
  }, [
    toEnable,
    localLensFluencers,
    localCurrencies,
    localAmounts,
    setLensFluencers,
    setCurrencies,
    setAmounts,
    setSelectedReferenceModule
  ]);

  useEffect(() => {
    if (showModal) {
      setLocalLensFluencers(lensFluencers);
      setLocalCurrencies(currencies);
      setLocalAmounts(amounts);
      setEnableSave(false);
    }
  }, [showModal, lensFluencers, currencies, amounts]);

  const disableSave = useMemo(() => {
    if (!enableSave) {
      return true;
    }
    // @ts-ignore
    if (Object.values(localAmounts).find((amount) => parseInt(amount) === 0)) {
      return true;
    }
    return false;
  }, [enableSave, localAmounts, localLensFluencers]);

  return (
    <>
      <Tooltip placement="top" content={'Promote 🔥'}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          type="button"
          onClick={() => {
            setShowModal(!showModal);
            Mixpanel.track(PUBLICATION.NEW.REFERENCE_MODULE.PROMOTE);
          }}
          aria-label="Choose Reference Module"
        >
          <div className="text-brand">
            <SpeakerphoneIcon className="w-5 h-5" />
          </div>
        </motion.button>
      </Tooltip>

      <Modal
        size="md"
        title="Who would you like to promote the post by?"
        icon={<SpeakerphoneIcon className="w-5 h-5 text-brand" />}
        show={showModal}
        onClose={() => {
          setLocalLensFluencers([]);
          setLocalAmounts([]);
          setLocalCurrencies([]);
          setShowModal(false);
        }}
      >
        <div>
          <div className="flex p-3 items-center space-x-3">
            <div className="w-full">
              <Search onSelect={onAddInfluencer} />
            </div>
            <div>
              <Button disabled={toEnable ? false : disableSave} onClick={onSave} className="w-full">
                {toEnable ? 'Enable' : 'Save'}
              </Button>
            </div>
          </div>
          {localLensFluencers.map((profile, index) => {
            return (
              <div className="flex p-3 items-center space-x-3" key={profile.handle}>
                <div className="w-full">
                  <UserProfile profile={profile} />
                </div>
                <select
                  className="w-full bg-white rounded-xl border border-gray-300 outline-none dark:bg-gray-800 disabled:bg-gray-500 disabled:bg-opacity-20 disabled:opacity-60 dark:border-gray-700/80 focus:border-brand-500 focus:ring-brand-400"
                  onChange={(e) => onSelectCurrency(e, profile)}
                  value={localCurrencies[profile.handle]}
                >
                  {data?.enabledModuleCurrencies.map((currency: Erc20) => (
                    <option key={currency.address} value={currency.address}>
                      {currency.name}
                    </option>
                  ))}
                </select>
                <Input
                  value={localAmounts[profile.handle] || ''}
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
    </>
  );
};

export default PromoteModule;
