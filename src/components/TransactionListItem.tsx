import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { Linking, View, ViewStyle } from 'react-native';
import Lnurl from '../class/lnurl';
import TransactionExpiredIcon from '../components/icons/TransactionExpiredIcon';
import TransactionIncomingIcon from '../components/icons/TransactionIncomingIcon';
import TransactionOffchainIcon from '../components/icons/TransactionOffchainIcon';
import TransactionOffchainIncomingIcon from '../components/icons/TransactionOffchainIncomingIcon';
import TransactionOnchainIcon from '../components/icons/TransactionOnchainIcon';
import TransactionOutgoingIcon from '../components/icons/TransactionOutgoingIcon';
import TransactionPendingIcon from '../components/icons/TransactionPendingIcon';
import TransactionEthereumIcon from '../components/icons/TransactionEthereumIcon';
import loc, { formatBalanceWithoutSuffix, transactionTimeToReadable } from '../loc';
import { CryptoUnit } from '../models/cryptoUnits';
import { useSettings } from '../hooks/context/useSettings';
import ListItem from './ListItem';
import { useTheme } from './themes';
import { Action, ToolTipMenuProps } from './types';
import { useExtendedNavigation } from '../hooks/useExtendedNavigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { DetailViewStackParamList } from '../navigation/DetailViewStackParamList';
import { useStorage } from '../hooks/context/useStorage';
import ToolTipMenu from './TooltipMenu';
import { CommonToolTipActions } from '../typings/CommonToolTipActions';
import { pop } from '../NavigationService';
import { LightningTransaction } from '../class/wallets/types/LightningTransaction';
import { Transaction } from '../class/wallets/types/Transaction';

interface TransactionListItemProps {
  itemPriceUnit?: CryptoUnit;
  walletID: string;
  item: Transaction & LightningTransaction; // using type intersection to have less issues with ts
  searchQuery?: string;
  style?: ViewStyle;
  renderHighlightedText?: (text: string, query: string) => JSX.Element;
}

type NavigationProps = NativeStackNavigationProp<DetailViewStackParamList>;

export const TransactionListItem: React.FC<TransactionListItemProps> = React.memo(
  ({ item, itemPriceUnit = CryptoUnit.BTC, walletID, searchQuery, style, renderHighlightedText }) => {
    const [subtitleNumberOfLines, setSubtitleNumberOfLines] = useState(1);
    const { colors } = useTheme();
    const { navigate } = useExtendedNavigation<NavigationProps>();
    const menuRef = useRef<ToolTipMenuProps>();
    const { txMetadata, counterpartyMetadata, wallets } = useStorage();
    const { language, selectedBlockExplorer } = useSettings();
    const containerStyle = useMemo(
      () => ({
        backgroundColor: colors.background,
        borderBottomColor: colors.lightBorder,
      }),
      [colors.background, colors.lightBorder],
    );

    const combinedStyle = useMemo(() => [containerStyle, style], [containerStyle, style]);

    const shortenContactName = (name: string): string => {
      if (name.length < 16) return name;
      return name.substr(0, 7) + '...' + name.substr(name.length - 7, 7);
    };

    const title = useMemo(() => {
      // For Ethereum transactions
      if (item.isEthereum) {
        if (item.status === 'pending' || item.confirmations === 0) {
          return loc.transactions.pending;
        } else if (item.isError || item.status === 'failed') {
          return loc.transactions.failed_transaction || 'Failed';
        } else {
          return transactionTimeToReadable(item.received!);
        }
      }
      // For Bitcoin transactions
      else if (item.confirmations === 0) {
        return loc.transactions.pending;
      } else {
        return transactionTimeToReadable(item.received!);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [item.confirmations, item.received, item.isEthereum, item.status, item.isError, language]);

    let counterparty;
    if (item.counterparty) {
      counterparty = counterpartyMetadata?.[item.counterparty]?.label ?? item.counterparty;
    }
    const txMemo = (counterparty ? `[${shortenContactName(counterparty)}] ` : '') + (txMetadata[item.hash]?.memo ?? '');
    const subtitle = useMemo(() => {
      // For Ethereum transactions
      if (item.isEthereum) {
        let sub = '';

        // Add confirmation info
        if (item.confirmations !== undefined && !item.isError && item.status !== 'failed') {
          sub = Number(item.confirmations) < 7 ? loc.formatString(loc.transactions.list_conf, { number: item.confirmations }) : '';
        }

        // Add transaction fee if available
        if (item.fee && item.value! < 0) {
          // Only show fee for outgoing transactions
          if (sub !== '') sub += ' • ';
          sub += `Fee: ${formatBalanceWithoutSuffix(item.fee, CryptoUnit.GWEI)} Gwei`;
        }

        // Add error message if failed
        if (item.isError || item.status === 'failed') {
          if (sub !== '') sub += ' • ';
          sub += 'Transaction failed';
        }

        // Add memo
        if (txMemo) {
          if (sub !== '') sub += ' • ';
          sub += txMemo;
        }

        return sub || undefined;
      }
      // For Bitcoin transactions
      else {
        let sub = Number(item.confirmations) < 7 ? loc.formatString(loc.transactions.list_conf, { number: item.confirmations }) : '';
        if (sub !== '') sub += ' ';
        sub += txMemo;
        if (item.memo) sub += item.memo;
        return sub || undefined;
      }
    }, [txMemo, item.confirmations, item.memo, item.isEthereum, item.status, item.isError, item.fee]);

    const formattedAmount = useMemo(() => {
      return formatBalanceWithoutSuffix(item.value && item.value, itemPriceUnit, true, item.isEthereum ? 'wei' : 'sats').toString();
    }, [item.value, item.isEthereum, itemPriceUnit]);

    const rowTitle = useMemo(() => {
      if (item.type === 'user_invoice' || item.type === 'payment_request') {
        const currentDate = new Date();
        const now = Math.floor(currentDate.getTime() / 1000);
        const invoiceExpiration = item.timestamp! + item.expire_time!;
        if (invoiceExpiration > now || item.ispaid) {
          return formattedAmount;
        } else {
          return loc.lnd.expired;
        }
      }
      return formattedAmount;
    }, [item, formattedAmount]);

    const rowTitleStyle = useMemo(() => {
      let color = colors.successColor;

      if (item.type === 'user_invoice' || item.type === 'payment_request') {
        const currentDate = new Date();
        const now = (currentDate.getTime() / 1000) | 0; // eslint-disable-line no-bitwise
        const invoiceExpiration = item.timestamp! + item.expire_time!;

        if (invoiceExpiration > now) {
          color = colors.successColor;
        } else if (invoiceExpiration < now) {
          if (item.ispaid) {
            color = colors.successColor;
          } else {
            color = '#9AA0AA';
          }
        }
      } else if (item.value! / 100000000 < 0) {
        color = colors.foregroundColor;
      }

      return {
        color,
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'right',
      };
    }, [item, colors.foregroundColor, colors.successColor]);

    const determineTransactionTypeAndAvatar = () => {
      // Ethereum transactions handling
      if (item.isEthereum) {
        // Pending Ethereum transaction
        if (item.status === 'pending' || (!item.confirmations && item.confirmations !== 0)) {
          return {
            label: loc.transactions.pending_transaction,
            icon: <TransactionPendingIcon />,
          };
        }

        // Failed Ethereum transaction
        if (item.isError || item.status === 'failed') {
          return {
            label: loc.transactions.failed_transaction || 'Failed transaction',
            icon: <TransactionExpiredIcon />,
          };
        }

        // Confirmed Ethereum transaction (either outgoing or incoming)
        if (item.value! < 0) {
          return {
            label: loc.transactions.outgoing_transaction,
            icon: <TransactionEthereumIcon />,
          };
        } else {
          return {
            label: loc.transactions.incoming_transaction,
            icon: <TransactionEthereumIcon />,
          };
        }
      }

      // Bitcoin transactions
      if (item.category === 'receive' && item.confirmations! < 3) {
        return {
          label: loc.transactions.pending_transaction,
          icon: <TransactionPendingIcon />,
        };
      }

      if (item.type && item.type === 'bitcoind_tx') {
        return {
          label: loc.transactions.onchain,
          icon: <TransactionOnchainIcon />,
        };
      }

      if (item.type === 'paid_invoice') {
        return {
          label: loc.transactions.offchain,
          icon: <TransactionOffchainIcon />,
        };
      }

      if (item.type === 'user_invoice' || item.type === 'payment_request') {
        const currentDate = new Date();
        const now = (currentDate.getTime() / 1000) | 0; // eslint-disable-line no-bitwise
        const invoiceExpiration = item.timestamp! + item.expire_time!;
        if (!item.ispaid && invoiceExpiration < now) {
          return {
            label: loc.transactions.expired_transaction,
            icon: <TransactionExpiredIcon />,
          };
        } else if (!item.ispaid) {
          return {
            label: loc.transactions.expired_transaction,
            icon: <TransactionPendingIcon />,
          };
        } else {
          return {
            label: loc.transactions.incoming_transaction,
            icon: <TransactionOffchainIncomingIcon />,
          };
        }
      }

      if (!item.confirmations) {
        return {
          label: loc.transactions.pending_transaction,
          icon: <TransactionPendingIcon />,
        };
      } else if (item.value! < 0) {
        return {
          label: loc.transactions.outgoing_transaction,
          icon: <TransactionOutgoingIcon />,
        };
      } else {
        return {
          label: loc.transactions.incoming_transaction,
          icon: <TransactionIncomingIcon />,
        };
      }
    };

    const { label: transactionTypeLabel, icon: avatar } = determineTransactionTypeAndAvatar();

    const amountWithUnit = useMemo(() => {
      const unitSuffix = itemPriceUnit === CryptoUnit.BTC || itemPriceUnit === CryptoUnit.SATS ? ` ${itemPriceUnit}` : ' ';
      return `${formattedAmount}${unitSuffix}`;
    }, [formattedAmount, itemPriceUnit]);

    useEffect(() => {
      setSubtitleNumberOfLines(1);
    }, [subtitle]);

    const onPress = useCallback(async () => {
      menuRef?.current?.dismissMenu?.();
      if (item.hash) {
        if (renderHighlightedText) {
          pop();
        }
        navigate('TransactionStatus', { hash: item.hash, walletID });
      } else if (item.type === 'user_invoice' || item.type === 'payment_request' || item.type === 'paid_invoice') {
        const lightningWallet = wallets.filter(wallet => wallet?.getID() === item.walletID);
        if (lightningWallet.length === 1) {
          try {
            // is it a successful lnurl-pay?
            const LN = new Lnurl(false, AsyncStorage);
            let paymentHash = item.payment_hash!;
            if (typeof paymentHash === 'object') {
              paymentHash = Buffer.from(paymentHash.data).toString('hex');
            }
            const loaded = await LN.loadSuccessfulPayment(paymentHash);
            if (loaded) {
              navigate('ScanLndInvoiceRoot', {
                screen: 'LnurlPaySuccess',
                params: {
                  paymentHash,
                  justPaid: false,
                  fromWalletID: lightningWallet[0].getID(),
                },
              });
              return;
            }
          } catch (e) {
            console.debug(e);
          }

          navigate('LNDViewInvoice', {
            invoice: item,
            walletID: lightningWallet[0].getID(),
          });
        }
      }
    }, [item, renderHighlightedText, navigate, walletID, wallets]);

    const handleOnExpandNote = useCallback(() => {
      setSubtitleNumberOfLines(0);
    }, []);

    const subtitleProps = useMemo(() => ({ numberOfLines: subtitleNumberOfLines }), [subtitleNumberOfLines]);

    const handleOnCopyAmountTap = useCallback(() => Clipboard.setStringAsync(rowTitle.replace(/[\s\\-]/g, '')), [rowTitle]);
    const handleOnCopyTransactionID = useCallback(() => Clipboard.setStringAsync(item.hash), [item.hash]);
    const handleOnCopyNote = useCallback(() => Clipboard.setStringAsync(subtitle ?? ''), [subtitle]);
    const handleOnViewOnBlockExplorer = useCallback(() => {
      // Use a different block explorer for Ethereum transactions
      const baseUrl = item.isEthereum
        ? item.network === 'mainnet'
          ? 'https://etherscan.io'
          : `https://${item.network}.etherscan.io`
        : selectedBlockExplorer.url;

      const url = `${baseUrl}/tx/${item.hash}`;
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        }
      });
    }, [item.hash, item.isEthereum, item.network, selectedBlockExplorer]);

    const handleCopyOpenInBlockExplorerPress = useCallback(() => {
      // Use a different block explorer for Ethereum transactions
      const baseUrl = item.isEthereum
        ? item.network === 'mainnet'
          ? 'https://etherscan.io'
          : `https://${item.network}.etherscan.io`
        : selectedBlockExplorer.url;

      Clipboard.setStringAsync(`${baseUrl}/tx/${item.hash}`);
    }, [item.hash, item.isEthereum, item.network, selectedBlockExplorer]);

    const onToolTipPress = useCallback(
      (id: any) => {
        if (id === CommonToolTipActions.CopyAmount.id) {
          handleOnCopyAmountTap();
        } else if (id === CommonToolTipActions.CopyNote.id) {
          handleOnCopyNote();
        } else if (id === CommonToolTipActions.OpenInBlockExplorer.id) {
          handleOnViewOnBlockExplorer();
        } else if (id === CommonToolTipActions.ExpandNote.id) {
          handleOnExpandNote();
        } else if (id === CommonToolTipActions.CopyBlockExplorerLink.id) {
          handleCopyOpenInBlockExplorerPress();
        } else if (id === CommonToolTipActions.CopyTXID.id) {
          handleOnCopyTransactionID();
        }
      },
      [
        handleCopyOpenInBlockExplorerPress,
        handleOnCopyAmountTap,
        handleOnCopyNote,
        handleOnCopyTransactionID,
        handleOnExpandNote,
        handleOnViewOnBlockExplorer,
      ],
    );
    const toolTipActions = useMemo((): Action[] => {
      const actions: (Action | Action[])[] = [];

      if (rowTitle !== loc.lnd.expired) {
        actions.push(CommonToolTipActions.CopyAmount);
      }

      if (subtitle) {
        actions.push(CommonToolTipActions.CopyNote);
      }

      if (item.hash) {
        actions.push(CommonToolTipActions.CopyTXID, CommonToolTipActions.CopyBlockExplorerLink, [CommonToolTipActions.OpenInBlockExplorer]);
      }

      if (subtitle && subtitleNumberOfLines === 1) {
        actions.push([CommonToolTipActions.ExpandNote]);
      }

      return actions as Action[];
    }, [item.hash, subtitle, rowTitle, subtitleNumberOfLines]);

    const accessibilityState = useMemo(() => {
      return {
        expanded: subtitleNumberOfLines === 0,
      };
    }, [subtitleNumberOfLines]);

    return (
      <ToolTipMenu
        isButton
        actions={toolTipActions}
        onPressMenuItem={onToolTipPress}
        onPress={onPress}
        accessibilityLabel={`${transactionTypeLabel}, ${amountWithUnit}, ${subtitle ?? title}`}
        accessibilityRole="button"
        accessibilityState={accessibilityState}
      >
        <ListItem
          leftAvatar={avatar}
          title={title}
          subtitleNumberOfLines={subtitleNumberOfLines}
          subtitle={subtitle ? (renderHighlightedText ? renderHighlightedText(subtitle, searchQuery ?? '') : subtitle) : undefined}
          Component={View}
          subtitleProps={subtitleProps}
          chevron={false}
          rightTitle={rowTitle}
          rightTitleStyle={rowTitleStyle}
          containerStyle={combinedStyle}
        />
      </ToolTipMenu>
    );
  },
);
