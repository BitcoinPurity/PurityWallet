import { useNavigation } from '@react-navigation/native';
import React from 'react';
import loc from '../../loc';
import { SettingsSection, SettingsListItem, SettingsScrollView } from '../../components/SettingsSection';
import { isLightningUiEnabled } from '../../blue_modules/features';
import { isNotificationsCapable } from '../../blue_modules/notifications';

const NetworkSettings: React.FC = () => {
  const navigation = useNavigation();
  const navigateToElectrumSettings = () => {
    navigation.navigate('ElectrumSettings');
  };

  const navigateToLightningSettings = () => {
    navigation.navigate('LightningSettings');
  };

  const navigateToBlockExplorerSettings = () => {
    navigation.navigate('SettingsBlockExplorer');
  };

  const navigateToNotificationSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  return (
    <SettingsScrollView>
      <SettingsSection>
        <SettingsListItem
          title={loc.settings.block_explorer}
          iconName="blockExplorer"
          onPress={navigateToBlockExplorerSettings}
          testID="BlockExplorerSettings"
          chevron
        />

        <SettingsListItem
          title={loc.settings.network_electrum}
          iconName="electrum"
          onPress={navigateToElectrumSettings}
          testID="ElectrumSettings"
          chevron
          bottomDivider={isLightningUiEnabled || isNotificationsCapable}
        />

        {isLightningUiEnabled && (
          <SettingsListItem
            title={loc.settings.lightning_settings}
            iconName="lightning"
            onPress={navigateToLightningSettings}
            testID="LightningSettings"
            chevron
            bottomDivider={isNotificationsCapable}
          />
        )}

        {isNotificationsCapable && (
          <SettingsListItem
            title={loc.settings.notifications}
            iconName="notifications"
            onPress={navigateToNotificationSettings}
            testID="NotificationSettings"
            chevron
            bottomDivider={false}
          />
        )}
      </SettingsSection>
    </SettingsScrollView>
  );
};

export default NetworkSettings;
