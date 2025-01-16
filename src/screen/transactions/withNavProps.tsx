import { ParamListBase, RouteProp, useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import React from 'react';

type Options = {
  name?: string;
};

export type RouteType<R extends ParamListBase, N extends keyof R> = ReturnType<typeof useRoute<RouteProp<R, N>>>;
export type NavType<R extends ParamListBase, N extends keyof R> = ReturnType<typeof useNavigation<NavigationProp<R, N>>>;

export function withNavProps<R extends ParamListBase, N extends keyof R, P = object>(
  Component: React.FC<P> | React.ComponentClass<P, any>,
  options: Options,
): React.FC<
  P & {
    route: RouteType<R, N>;
    navigation: NavType<R, N>;
  }
> {
  const TComp = function (props: P) {
    const route = useRoute<RouteProp<R, N>>();
    const navigation = useNavigation<NavigationProp<R, N>>();

    return <Component {...props} route={route} navigation={navigation} />;
  };

  TComp.displayName = options?.name;

  return TComp;
}
