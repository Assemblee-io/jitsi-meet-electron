// @flow

import Button from '@atlaskit/button';
import { FieldTextStateless } from '@atlaskit/field-text';
import { SpotlightTarget } from '@atlaskit/onboarding';
import { AtlasKitThemeProvider } from '@atlaskit/theme';
import Page, { Grid, GridColumn } from '@atlaskit/page';

import { generateRoomWithoutSeparator } from 'js-utils/random';
import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'redux';
import type { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

import { Navbar } from '../../navbar';
import { Onboarding, startOnboarding } from '../../onboarding';
import { RecentList } from '../../recent-list';
import { createConferenceObjectFromURL } from '../../utils';

import { Body, FieldWrapper, Form, Header, Wrapper } from '../styled';

import AssembleeImage from '../../../images/logo_assemblee.png'
import '../style.css'

import styled from 'styled-components';

const Dummy = styled.div`
  background: #fea;
`;


type Props = {

    /**
     * Redux dispatch.
     */
    dispatch: Dispatch<*>;

    /**
     * React Router location object.
     */
    location: Object;

    /**
     * I18next translate function.
     */
     t: Function;
};

type State = {

    /**
     * Timer for animating the room name geneeration.
     */
    animateTimeoutId: ?TimeoutID,

    /**
     * Generated room name.
     */
    generatedRoomname: string,

    /**
     * Current room name placeholder.
     */
    roomPlaceholder: string,

    /**
     * Timer for re-generating a new room name.
     */
    updateTimeoutId: ?TimeoutID,

    /**
     * URL of the room to join.
     * If this is not a url it will be treated as room name for default domain.
     */
    url: string;

    cliked: boolean
};

/**
 * Welcome Component.
 */
class Welcome extends Component<Props, State> {
    /**
     * Initializes a new {@code Welcome} instance.
     *
     * @inheritdoc
     */
    constructor(props: Props) {
        super(props);

        // Initialize url value in state if passed using location state object.
        let url = '';

        // Check and parse url if exists in location state.
        if (props.location.state) {
            const { room, serverURL } = props.location.state;

            if (room && serverURL) {
                url = `${serverURL}/${room}`;
            }
        }

        this.myRef = [
            React.createRef(),
            React.createRef(),
            React.createRef(),
            React.createRef(),
            React.createRef(),
            React.createRef(),
            React.createRef(),
            React.createRef()
        ]

        this.state = {
            animateTimeoutId: undefined,
            generatedRoomname: '',
            roomPlaceholder: '',
            updateTimeoutId: undefined,
            url,
            value: '',
            list: [],
            focusInput: [true,false,false,false,false,false,false,false],
            clicked: false,
        };

        // Bind event handlers.
        this._animateRoomnameChanging = this._animateRoomnameChanging.bind(this);
        this._onURLChange = this._onURLChange.bind(this);
        this._onFormSubmit = this._onFormSubmit.bind(this);
        this._onJoin = this._onJoin.bind(this);
        this._updateRoomname = this._updateRoomname.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    /**
     * Start Onboarding once component is mounted.
     * Start generating randdom room names.
     *
     * NOTE: It autonatically checks if the onboarding is shown or not.
     *
     * @returns {void}
     */
    componentDidMount() {
        //this.props.dispatch(startOnboarding('welcome-page'));


        this._updateRoomname();
    }

    /**
     * Stop all timers when unmounting.
     *
     * @returns {voidd}
     */
    componentWillUnmount() {
        this._clearTimeouts();
    }

    /**
     * Render function of component.
     *
     * @returns {ReactElement}
     */
    render() {
        return (
            <Page navigation = { <Navbar /> }>
                <AtlasKitThemeProvider mode = 'light'>
                    <Wrapper>
                        { this._renderHeader() }
                        { this._renderBody() }
                    </Wrapper>
                </AtlasKitThemeProvider>
            </Page>
        );
    }

    _animateRoomnameChanging: (string) => void;

    /**
     * Animates the changing of the room name.
     *
     * @param {string} word - The part of room name that should be added to
     * placeholder.
     * @private
     * @returns {void}
     */
    _animateRoomnameChanging(word: string) {
        let animateTimeoutId;
        const roomPlaceholder = this.state.roomPlaceholder + word.substr(0, 1);

        if (word.length > 1) {
            animateTimeoutId
                = setTimeout(
                    () => {
                        this._animateRoomnameChanging(
                            word.substring(1, word.length));
                    },
                    70);
        }
        this.setState({
            animateTimeoutId,
            roomPlaceholder
        });
    }

    /**
     * Method that clears timeouts for animations and updates of room name.
     *
     * @private
     * @returns {void}
     */
    _clearTimeouts() {
        clearTimeout(this.state.animateTimeoutId);
        clearTimeout(this.state.updateTimeoutId);
    }

    _onFormSubmit: (*) => void;

    /**
     * Prevents submission of the form and delegates the join logic.
     *
     * @param {Event} event - Event by which this function is called.
     * @returns {void}
     */
    _onFormSubmit(event: Event) {
        event.preventDefault();
        this._onJoin();
    }

    _onJoin: (*) => void;

    /**
     * Redirect and join conference.
     *
     * @returns {void}
     */
    _onJoin() {
        console.log(this.state.list)
        const inputURL = this.state.list.join('') || this.state.generatedRoomname;
        console.log(inputURL)
        const conference = createConferenceObjectFromURL(inputURL);

        // Don't navigate if conference couldn't be created
        if (!conference) {
            return;
        }

        this.props.dispatch(push('/conference', conference));
    }

    _onLogin: (*) => void;

    /**
     * Redirect and join conference.
     *
     * @returns {void}
     */
    _onLogin() {
        const { shell } = window.require('electron');
        shell.openExternal('https://assemblee.io/app').then(r => console.log('coucou'));
    }



    handleChange(event) {
        const t = event.target.value
        const i = parseInt(event.target.name)
        if (event.target.value === '') {
            if (i > 0)
                this.myRef[i - 1].current.focus()
            this.setState(state => {
                const list = state.list.filter((item, j) => i !== j);

                return {
                    list,
                };
            });
        } else {
            console.log(i)
            if (i === 7) {
                this._onJoin()
            } else {
                this.myRef[i + 1].current.focus()
                this.setState(state => {
                    const list = state.list.concat(t);

                    return {
                        list,
                        value: '',
                    };
                });
            }
        }
    }


    _onURLChange: (*) => void;

    /**
     * Keeps URL input value and URL in state in sync.
     *
     * @param {SyntheticInputEvent<HTMLInputElement>} event - Event by which
     * this function is called.
     * @returns {void}
     */
    _onURLChange(event: SyntheticInputEvent<HTMLInputElement>) {
        this.setState({
            url: event.currentTarget.value
        });
    }

    /**
     * Renders the body for the welcome page.
     *
     * @returns {ReactElement}
     */
    _renderBody() {
        return (
            <Body>
                <RecentList />
            </Body>
        );
    }

    /**
     * Renders the header for the welcome page.
     *
     * @returns {ReactElement}
     */
    _renderHeader() {
        const locationState = this.props.location.state;
        const locationError = locationState && locationState.error;
        const { t } = this.props;

        return (
            <Header style= {{ backgroundColor: "white" }}>
                <SpotlightTarget name = 'conference-url'>
                    <Form  onSubmit = { this._onFormSubmit }>
                        <img className = {'center'} src = { AssembleeImage } style= {{ width: '80%' }}/>
                        <FieldWrapper>
                            <Page>
                                <Grid>
                                    { this.state.clicked &&
                                    <div id="form">
                                        <div className="form__group form__pincode">
                                            <label className="dark-inverted">
                                                Vous avez un code de réunion ? Entrez-le ici.
                                            </label>
                                            {
                                                this.state.focusInput.map((value, index) => {
                                                    return <input type="text" ref={this.myRef[index]}
                                                                  value={this.state.list[index]}
                                                                  onChange={this.handleChange} name={index}
                                                                  maxLength="1" pattern="[a-zA-Z]*" tabIndex="1"
                                                                  placeholder="·" autoComplete="off" key={index}/>
                                                })
                                            }
                                        </div>
                                    </div>
                                    }
                                    <div className={'centerDiv'}>
                                        <a className={'button-join-app blue'} onClick = { async () => {
                                            await this.setState({clicked: true})
                                            return this.myRef[0].current.focus()
                                        } }>
                                            Rejoindre une reunion
                                        </a>
                                    </div>
                                    <div className={'centerDiv'}>
                                        <a className={'button-join-app white'} onClick={ this._onLogin }>
                                            Connexion
                                        </a>
                                    </div>
                                </Grid>
                            </Page>
                        </FieldWrapper>
                    </Form>
                </SpotlightTarget>
            </Header>
        );
    }

    _updateRoomname: () => void;

    /**
     * Triggers the generation of a new room name and initiates an animation of
     * its changing.
     *
     * @protected
     * @returns {void}
     */
    _updateRoomname() {
        const generatedRoomname = generateRoomWithoutSeparator();
        const roomPlaceholder = '';
        const updateTimeoutId = setTimeout(this._updateRoomname, 10000);

        this._clearTimeouts();
        this.setState(
            {
                generatedRoomname,
                roomPlaceholder,
                updateTimeoutId
            },
            () => this._animateRoomnameChanging(generatedRoomname));
    }
}

export default compose(connect(), withTranslation())(Welcome);
