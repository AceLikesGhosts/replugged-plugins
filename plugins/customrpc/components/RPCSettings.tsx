import { ReactNode, useMemo, useState } from "react";
import { common, components } from "replugged";
import type { ModalProps } from "replugged/dist/renderer/modules/common/modal";
import { RPC } from "..";
import Save from "./Save";
import TextInput from "./TextInput";

const {
  Modal: { ModalRoot, ModalHeader, ModalContent, ModalCloseButton },
  Text,
  Flex,
  Category,
  ErrorBoundary,
  SwitchItem,
  RadioItem
} = components;

const ActivityTypes = {
  Game: 0,
  Streaming: 1,
  Listening: 2,
  Watching: 3,
  Competing: 5
} as const;

const AutoWrap = ({
  children,
  grow = 1,
  shrink = 1,
  wrap,
}: {
  children: ReactNode;
  grow?: number;
  shrink?: number;
  wrap?: boolean;
}) => {
  if (!Array.isArray(children)) children = [children];
  return (
    <>
      {(children as ReactNode[]).map((child) => (
        <Flex.Child wrap={wrap} grow={grow} shrink={shrink}>
          {child}
        </Flex.Child>
      ))}
    </>
  );
};

function RPCSettings({
  rpc,
  onSave,
  ...props
}: ModalProps & { rpc: RPC; onSave: (rpc: RPC) => void }) {
  const [orgRPC, setOrgRPC] = useState(window._.cloneDeep(rpc));
  const [tempRPC, setRPC] = useState(window._.cloneDeep(rpc));

  const changes = useMemo(() => !window._.isEqual(orgRPC, tempRPC), [tempRPC, orgRPC]);
  const updateRPC = (rpc: Partial<RPC>) => {
    setRPC((r) => ({ ...r, ...rpc }));
  };

  return (
    <ModalRoot className="rprpc-edit" size="large" {...props}>
      <ModalHeader>
        <AutoWrap>
          <Text variant="heading-lg/semibold" style={{ flexGrow: 1 }}>
            Edit RPC
          </Text>
          <ModalCloseButton onClick={props.onClose} />
        </AutoWrap>
      </ModalHeader>
      <ModalContent className="rprpc-content">
        <Flex wrap={Flex.Wrap.WRAP}>
          <AutoWrap wrap grow={0} shrink={0}>
            <TextInput
              value={tempRPC.clientId}
              divider={false}
              required
              onChange={(v) => updateRPC({ clientId: v })}>
              Client Id
            </TextInput>

            <TextInput
              value={tempRPC.name}
              divider={false}
              required
              onChange={(v) => updateRPC({ name: v })}>
              Name
            </TextInput>

            <TextInput
              value={tempRPC.details}
              divider={false}
              onChange={(v) => updateRPC({ details: v })}>
              Details
            </TextInput>

            <TextInput
              value={tempRPC.state}
              divider={false}
              onChange={(v) => updateRPC({ state: v })}>
              State
            </TextInput>
          </AutoWrap>
        </Flex>

        <SwitchItem
          value={tempRPC.showTime}
          onChange={() => updateRPC({ showTime: !tempRPC.showTime })}>
          Show Time
        </SwitchItem>

        <Category title="Activity Type">
          <Flex wrap={Flex.Wrap.WRAP}>
            <AutoWrap wrap grow={1} shrink={1}>
              <RadioItem
                note="What type of activity to display."
                options={Object.keys(ActivityTypes).map((key) => {
                  return {
                    name: key,
                    // Type casting hell.
                    value: String(ActivityTypes[key as unknown as keyof typeof ActivityTypes])
                  };
                })}
                value={String(tempRPC.type)}
                onChange={(v) => updateRPC({ type: Number(v.value) })}
              >
                Activity Type
              </RadioItem>
            </AutoWrap>
          </Flex>

          <Flex wrap={Flex.Wrap.WRAP}>
            <AutoWrap wrap grow={1} shrink={1}>
              <TextInput
                note="A Twitch or Youtube link"
                placeholder="https://twitch.tv/..."
                value={tempRPC.url}
                onChange={(v) => updateRPC({ url: v })}
                disabled={tempRPC.type !== 1 /** if type != 'streaming' dont allow them to type */}
              >
                Stream URL
              </TextInput>
            </AutoWrap>
          </Flex>
        </Category>

        <Category title="Assets">
          <Flex wrap={Flex.Wrap.WRAP}>
            <AutoWrap wrap grow={1} shrink={1}>
              <TextInput
                value={tempRPC.largeText}
                divider={false}
                required
                onChange={(v) => updateRPC({ largeText: v })}>
                Large Image Text
              </TextInput>
              <TextInput
                placeholder="https://cdn.discordapp.com/"
                value={tempRPC.largeImage}
                divider={false}
                required
                onChange={(v) => updateRPC({ largeImage: v })}>
                Large Image Url
              </TextInput>
            </AutoWrap>
          </Flex>
          <Flex wrap={Flex.Wrap.WRAP}>
            <AutoWrap wrap grow={1} shrink={1}>
              <TextInput
                value={tempRPC.smallText}
                divider={false}
                required
                onChange={(v) => updateRPC({ smallText: v })}>
                Small Image Text
              </TextInput>
              <TextInput
                placeholder="https://cdn.discordapp.com/"
                value={tempRPC.smallImage}
                divider={false}
                required
                onChange={(v) => updateRPC({ smallImage: v })}>
                Small Image Url
              </TextInput>
            </AutoWrap>
          </Flex>
        </Category>

        <Category title="Buttons">
          {tempRPC.buttons.map((button, idx) => (
            <Flex wrap={Flex.Wrap.WRAP}>
              <AutoWrap wrap grow={1} shrink={1}>
                <TextInput
                  value={button.label}
                  divider={false}
                  required
                  onChange={(v) => {
                    tempRPC.buttons[idx].label = v;
                    updateRPC({ buttons: tempRPC.buttons });
                  }}>
                  Button {idx + 1} label
                </TextInput>
                <TextInput
                  placeholder="https://"
                  value={button.url}
                  divider={false}
                  required
                  onChange={(v) => {
                    tempRPC.buttons[idx].url = v;
                    updateRPC({ buttons: tempRPC.buttons });
                  }}>
                  Button {idx + 1} url
                </TextInput>
              </AutoWrap>
            </Flex>
          ))}
        </Category>

        <Category title="Party">
          <Flex wrap={Flex.Wrap.WRAP}>
            <AutoWrap wrap grow={1} shrink={1}>
              <TextInput
                value={(tempRPC.party?.members as unknown as string) ?? ""}
                divider={false}
                onChange={(v) => {
                  updateRPC({
                    party: {
                      members: v ? parseInt(v, 10) : undefined,
                      size: tempRPC.party.size,
                    },
                  });
                }}>
                Party Members
              </TextInput>
              <TextInput
                value={(tempRPC.party?.size as unknown as string) ?? ""}
                note='"State" will have to be defined for the party information to show'
                divider={false}
                onChange={(v) =>
                  updateRPC({
                    party: {
                      members: tempRPC.party?.members ?? 0,
                      size: v ? parseInt(v, 10) : undefined,
                    },
                  })
                }>
                Party Size
              </TextInput>
            </AutoWrap>
          </Flex>
        </Category>
        {changes && (
          <Save
            onReset={() => setRPC(window._.cloneDeep(rpc))}
            onSave={() => {
              setOrgRPC(window._.cloneDeep(tempRPC));
              onSave(tempRPC);
            }}
          />
        )}
      </ModalContent>
    </ModalRoot>
  );
}

export function openRPCModal(rpc: RPC, onSave: (rpc: RPC) => void) {
  common.modal.openModal((props) => (
    <ErrorBoundary>
      <RPCSettings {...{ ...props, rpc, onSave }} />
    </ErrorBoundary>
  ));
}
